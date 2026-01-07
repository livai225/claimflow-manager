-- Corriger les fonctions avec search_path manquant
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.claim_number := 'SIN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('claim_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$;