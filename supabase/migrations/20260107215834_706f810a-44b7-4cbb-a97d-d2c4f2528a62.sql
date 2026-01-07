-- Enum pour les rôles utilisateurs
CREATE TYPE public.app_role AS ENUM (
  'admin', 'responsable', 'gestionnaire', 'expert', 
  'medecin_expert', 'comptabilite', 'direction', 'audit', 'assure'
);

-- Enum pour les statuts de sinistre
CREATE TYPE public.claim_status AS ENUM (
  'declaration', 'instruction', 'expertise', 'offre', 
  'acceptation', 'paiement', 'cloture', 'rejete'
);

-- Enum pour les types de sinistre
CREATE TYPE public.claim_type AS ENUM (
  'automobile', 'habitation', 'sante', 'vie', 'responsabilite_civile', 'autre'
);

-- Table des profils utilisateurs
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des rôles utilisateurs (séparée pour la sécurité)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'assure',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Table des sinistres
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT NOT NULL UNIQUE,
  policy_number TEXT NOT NULL,
  type claim_type NOT NULL,
  status claim_status NOT NULL DEFAULT 'declaration',
  description TEXT NOT NULL,
  incident_date DATE NOT NULL,
  declaration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_claimed DECIMAL(12,2),
  amount_approved DECIMAL(12,2),
  amount_paid DECIMAL(12,2),
  declarant_id UUID NOT NULL REFERENCES public.profiles(id),
  gestionnaire_id UUID REFERENCES public.profiles(id),
  expert_id UUID REFERENCES public.profiles(id),
  medecin_id UUID REFERENCES public.profiles(id),
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des événements/historique
CREATE TABLE public.claim_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fonction pour vérifier le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Fonction pour obtenir les rôles d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- Trigger pour créer le profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar', UPPER(LEFT(NEW.email, 2)))
  );
  
  -- Assigner le rôle par défaut 'assure'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'assure');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Fonction pour générer un numéro de sinistre
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.claim_number := 'SIN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('claim_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1;

CREATE TRIGGER generate_claim_number_trigger
  BEFORE INSERT ON public.claims
  FOR EACH ROW
  WHEN (NEW.claim_number IS NULL OR NEW.claim_number = '')
  EXECUTE FUNCTION public.generate_claim_number();

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claim_events ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Staff can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'responsable') OR
    public.has_role(auth.uid(), 'gestionnaire') OR
    public.has_role(auth.uid(), 'direction')
  );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Politiques RLS pour user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Politiques RLS pour claims
CREATE POLICY "Assures can view their own claims"
  ON public.claims FOR SELECT
  TO authenticated
  USING (declarant_id = auth.uid());

CREATE POLICY "Assures can create claims"
  ON public.claims FOR INSERT
  TO authenticated
  WITH CHECK (declarant_id = auth.uid());

CREATE POLICY "Staff can view all claims"
  ON public.claims FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'responsable') OR
    public.has_role(auth.uid(), 'gestionnaire') OR
    public.has_role(auth.uid(), 'direction') OR
    public.has_role(auth.uid(), 'comptabilite')
  );

CREATE POLICY "Experts can view assigned claims"
  ON public.claims FOR SELECT
  TO authenticated
  USING (
    expert_id = auth.uid() OR
    medecin_id = auth.uid()
  );

CREATE POLICY "Audit can view all claims readonly"
  ON public.claims FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'audit'));

CREATE POLICY "Gestionnaires can update claims"
  ON public.claims FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'responsable') OR
    public.has_role(auth.uid(), 'gestionnaire')
  );

-- Politiques RLS pour documents
CREATE POLICY "Users can view documents of their claims"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.claims c
      WHERE c.id = claim_id AND c.declarant_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all documents"
  ON public.documents FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'responsable') OR
    public.has_role(auth.uid(), 'gestionnaire') OR
    public.has_role(auth.uid(), 'expert') OR
    public.has_role(auth.uid(), 'audit')
  );

CREATE POLICY "Users can upload documents to their claims"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.claims c
      WHERE c.id = claim_id AND c.declarant_id = auth.uid()
    )
  );

CREATE POLICY "Staff can upload documents"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'gestionnaire') OR
      public.has_role(auth.uid(), 'expert')
    )
  );

-- Politiques RLS pour claim_events
CREATE POLICY "Users can view events of their claims"
  ON public.claim_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.claims c
      WHERE c.id = claim_id AND c.declarant_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all events"
  ON public.claim_events FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'responsable') OR
    public.has_role(auth.uid(), 'gestionnaire') OR
    public.has_role(auth.uid(), 'audit')
  );

CREATE POLICY "Staff can create events"
  ON public.claim_events FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      public.has_role(auth.uid(), 'admin') OR
      public.has_role(auth.uid(), 'gestionnaire') OR
      public.has_role(auth.uid(), 'expert')
    )
  );