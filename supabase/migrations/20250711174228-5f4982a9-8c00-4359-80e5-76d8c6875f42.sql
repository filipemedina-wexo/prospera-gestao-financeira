-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  saas_client_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID,
  seller_id UUID,
  total_value DECIMAL(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create proposal items table
CREATE TABLE public.proposal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL,
  product_service_id UUID,
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sellers table for commercial team
CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  saas_client_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  commission_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for proposals
CREATE POLICY "Users can manage proposals for their client" ON public.proposals
FOR ALL USING ((saas_client_id = get_current_user_client_id()) OR is_super_admin());

-- Create RLS policies for proposal items
CREATE POLICY "Users can manage proposal items for their client" ON public.proposal_items
FOR ALL USING (
  proposal_id IN (
    SELECT id FROM public.proposals 
    WHERE saas_client_id = get_current_user_client_id()
  ) OR is_super_admin()
);

-- Create RLS policies for sellers
CREATE POLICY "Users can manage sellers for their client" ON public.sellers
FOR ALL USING ((saas_client_id = get_current_user_client_id()) OR is_super_admin());

-- Add foreign key constraints
ALTER TABLE public.proposals
ADD CONSTRAINT proposals_saas_client_id_fkey 
FOREIGN KEY (saas_client_id) REFERENCES public.saas_clients(id);

ALTER TABLE public.proposals
ADD CONSTRAINT proposals_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id);

ALTER TABLE public.proposals
ADD CONSTRAINT proposals_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.sellers(id);

ALTER TABLE public.proposal_items
ADD CONSTRAINT proposal_items_proposal_id_fkey 
FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE CASCADE;

ALTER TABLE public.proposal_items
ADD CONSTRAINT proposal_items_product_service_id_fkey 
FOREIGN KEY (product_service_id) REFERENCES public.products_services(id);

ALTER TABLE public.sellers
ADD CONSTRAINT sellers_saas_client_id_fkey 
FOREIGN KEY (saas_client_id) REFERENCES public.saas_clients(id);

-- Add triggers for updated_at
CREATE TRIGGER update_proposals_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposal_items_updated_at
BEFORE UPDATE ON public.proposal_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at
BEFORE UPDATE ON public.sellers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle proposal acceptance and create account receivable
CREATE OR REPLACE FUNCTION public.handle_proposal_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create account receivable when status changes to 'aceita'
  IF NEW.status = 'aceita' AND (OLD.status IS NULL OR OLD.status != 'aceita') THEN
    INSERT INTO public.accounts_receivable (
      saas_client_id,
      financial_client_id,
      description,
      amount,
      due_date,
      status,
      category,
      notes
    ) VALUES (
      NEW.saas_client_id,
      NEW.client_id,
      'Proposta aceita: ' || NEW.title,
      NEW.total_value,
      CURRENT_DATE + INTERVAL '30 days', -- Default 30 days payment term
      'pending',
      'Vendas',
      'Gerado automaticamente da proposta ID: ' || NEW.id
    );
    
    -- Update accepted_at timestamp
    NEW.accepted_at = now();
  END IF;
  
  -- Update rejected_at timestamp if status is 'rejeitada'
  IF NEW.status = 'rejeitada' AND (OLD.status IS NULL OR OLD.status != 'rejeitada') THEN
    NEW.rejected_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for proposal acceptance
CREATE TRIGGER handle_proposal_acceptance_trigger
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.handle_proposal_acceptance();