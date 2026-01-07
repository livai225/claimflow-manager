-- Créer le bucket de stockage pour les documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('claim-documents', 'claim-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Politique pour permettre aux utilisateurs authentifiés de voir les documents de leurs sinistres
CREATE POLICY "Users can view their claim documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'claim-documents' AND
  EXISTS (
    SELECT 1 FROM public.claims c
    JOIN public.documents d ON d.claim_id = c.id
    WHERE d.url LIKE '%' || name AND c.declarant_id = auth.uid()
  )
);

-- Politique pour permettre au staff de voir tous les documents
CREATE POLICY "Staff can view all claim documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'claim-documents' AND (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'gestionnaire') OR
    public.has_role(auth.uid(), 'responsable') OR
    public.has_role(auth.uid(), 'expert')
  )
);

-- Politique pour permettre aux utilisateurs authentifiés d'uploader des documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'claim-documents');

-- Politique pour permettre aux utilisateurs de supprimer leurs propres documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'claim-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);