-- ============================================================================
-- MUSK INVESTMENT - PRODUCTION SUPABASE DATABASE SCHEMA & MIGRATIONS
-- DESIGNED FOR POSTGRESQL (SUPABASE PLPGSQL COMPLIANT)
-- FULLY IDEMPOTENT & MULTI-RUN COMPATIBLE
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ROLES AND CUSTOM TYPES / ENUMS (Safely created if they do not exist)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status_type') THEN
        CREATE TYPE user_status_type AS ENUM ('Active', 'Suspended');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM ('user', 'admin');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status_type') THEN
        CREATE TYPE withdrawal_status_type AS ENUM ('Pending', 'Approved', 'Rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deposit_status_type') THEN
        CREATE TYPE deposit_status_type AS ENUM ('Pending', 'Approved', 'Rejected');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status_type') THEN
        CREATE TYPE ticket_status_type AS ENUM ('Open', 'Pending', 'Resolved', 'Closed');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority_type') THEN
        CREATE TYPE ticket_priority_type AS ENUM ('Low', 'Medium', 'High');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'announcement_category_type') THEN
        CREATE TYPE announcement_category_type AS ENUM ('Update', 'Alert', 'Maintenance', 'General');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_log_type') THEN
        CREATE TYPE activity_log_type AS ENUM ('User', 'Admin');
    END IF;
END$$;

-- ============================================================================
-- 2. TABLES SCHEMAS (Using IF NOT EXISTS to prevent error 42P07)
-- ============================================================================

-- A. Users Profile Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    status user_status_type NOT NULL DEFAULT 'Active',
    role user_role_type NOT NULL DEFAULT 'user',
    avatar_seed VARCHAR(100) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- B. Investment Plans Table
CREATE TABLE IF NOT EXISTS public.investment_plans (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    apr NUMERIC(5, 2) NOT NULL CHECK (apr >= 0),
    min_deposit NUMERIC(12, 2) NOT NULL CHECK (min_deposit >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0), -- in days
    description TEXT,
    badge VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- C. User Deposits Ledger Table
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    plan_id VARCHAR(100) REFERENCES public.investment_plans(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(100) NOT NULL,
    status deposit_status_type NOT NULL DEFAULT 'Pending',
    reference_no VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- D. Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(100) NOT NULL,
    address_details TEXT NOT NULL,
    status withdrawal_status_type NOT NULL DEFAULT 'Pending',
    reference_no VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- E. System Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    category announcement_category_type NOT NULL DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- F. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority ticket_priority_type NOT NULL DEFAULT 'Medium',
    message TEXT NOT NULL,
    status ticket_status_type NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- G. Support Ticket Replies Table
CREATE TABLE IF NOT EXISTS public.ticket_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'admin')),
    sender_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- H. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    sender VARCHAR(50) NOT NULL CHECK (sender IN ('user', 'admin')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- I. Secure Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    action TEXT NOT NULL,
    type activity_log_type NOT NULL DEFAULT 'User',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- J. User Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- K. Payment Wallets Configuration (Singleton Table)
CREATE TABLE IF NOT EXISTS public.payment_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    bank_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    routing_number VARCHAR(100) NOT NULL,
    btc_address VARCHAR(255) NOT NULL,
    usdt_trc_address VARCHAR(255) NOT NULL,
    usdt_erc_address VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- L. QR Codes Configurations (Singleton Table)
CREATE TABLE IF NOT EXISTS public.qr_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    btc_qr TEXT NOT NULL,
    usdt_trc_qr TEXT NOT NULL,
    usdt_erc_qr TEXT NOT NULL,
    bank_qr TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- M. Main System Settings (Singleton Table)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    website_name VARCHAR(255) NOT NULL DEFAULT 'Musk Investment',
    support_email VARCHAR(255) NOT NULL DEFAULT 'support@muskinvestment.com',
    support_phone VARCHAR(50) NOT NULL DEFAULT '+1 (800) 555-MUSK',
    company_address TEXT NOT NULL DEFAULT 'Starbase Launch Facility, Boca Chica, Texas, USA',
    footer_text TEXT NOT NULL DEFAULT '© 2026 Musk Investment. Designed for professional staking and high-throughput technological asset compounding. Backed by automated aerospace energy allocation pools.',
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    registration_open BOOLEAN NOT NULL DEFAULT TRUE,
    deposit_open BOOLEAN NOT NULL DEFAULT TRUE,
    withdrawal_open BOOLEAN NOT NULL DEFAULT TRUE,
    referral_program_open BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- N. App Central Key-Value Store Table (Used by the server-side sync manager)
CREATE TABLE IF NOT EXISTS public.musk_app_store (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 3. INDEXES FOR QUERY OPTIMIZATION (Using IF NOT EXISTS)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket_id ON public.ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- ============================================================================
-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Profile Policies
DROP POLICY IF EXISTS "Public profiles are readable by anyone" ON public.profiles;
CREATE POLICY "Public profiles are readable by anyone" ON public.profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can edit their own profiles" ON public.profiles;
CREATE POLICY "Users can edit their own profiles" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can perform any action on profiles" ON public.profiles;
CREATE POLICY "Admin can perform any action on profiles" ON public.profiles
    FOR ALL USING (public.is_admin());

-- Investment Plans Policies
DROP POLICY IF EXISTS "Investment plans are viewable by everyone" ON public.investment_plans;
CREATE POLICY "Investment plans are viewable by everyone" ON public.investment_plans
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Admin can manage investment plans" ON public.investment_plans;
CREATE POLICY "Only Admin can manage investment plans" ON public.investment_plans
    FOR ALL USING (public.is_admin());

-- Deposits Policies
DROP POLICY IF EXISTS "Users can view their own deposits" ON public.deposits;
CREATE POLICY "Users can view their own deposits" ON public.deposits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own deposits" ON public.deposits;
CREATE POLICY "Users can create their own deposits" ON public.deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can perform any action on deposits" ON public.deposits;
CREATE POLICY "Admin can perform any action on deposits" ON public.deposits
    FOR ALL USING (public.is_admin());

-- Withdrawals Policies
DROP POLICY IF EXISTS "Users can view their own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view their own withdrawals" ON public.withdrawals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can request a withdrawal" ON public.withdrawals;
CREATE POLICY "Users can request a withdrawal" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all withdrawals" ON public.withdrawals;
CREATE POLICY "Admin can manage all withdrawals" ON public.withdrawals
    FOR ALL USING (public.is_admin());

-- Announcements Policies
DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON public.announcements;
CREATE POLICY "Announcements are viewable by everyone" ON public.announcements
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Admin can manage announcements" ON public.announcements;
CREATE POLICY "Only Admin can manage announcements" ON public.announcements
    FOR ALL USING (public.is_admin());

-- Support Tickets Policies
DROP POLICY IF EXISTS "Users can view their own support tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own support tickets" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can open tickets" ON public.support_tickets;
CREATE POLICY "Users can open tickets" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can modify their open tickets" ON public.support_tickets;
CREATE POLICY "Users can modify their open tickets" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all tickets" ON public.support_tickets;
CREATE POLICY "Admin can manage all tickets" ON public.support_tickets
    FOR ALL USING (public.is_admin());

-- Ticket Replies Policies
DROP POLICY IF EXISTS "Users can view replies for their own tickets" ON public.ticket_replies;
CREATE POLICY "Users can view replies for their own tickets" ON public.ticket_replies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_replies.ticket_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can add replies to their own tickets" ON public.ticket_replies;
CREATE POLICY "Users can add replies to their own tickets" ON public.ticket_replies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.support_tickets
            WHERE id = ticket_replies.ticket_id AND user_id = auth.uid()
        ) AND sender = 'user'
    );

DROP POLICY IF EXISTS "Admin can manage all ticket replies" ON public.ticket_replies;
CREATE POLICY "Admin can manage all ticket replies" ON public.ticket_replies
    FOR ALL USING (public.is_admin());

-- Chat Messages Policies
DROP POLICY IF EXISTS "Users can view their chats" ON public.chat_messages;
CREATE POLICY "Users can view their chats" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can submit chat messages" ON public.chat_messages;
CREATE POLICY "Users can submit chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all chat messages" ON public.chat_messages;
CREATE POLICY "Admin can manage all chat messages" ON public.chat_messages
    FOR ALL USING (public.is_admin());

-- Activity Logs Policies
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view their own activity logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can view all activity logs" ON public.activity_logs;
CREATE POLICY "Admin can view all activity logs" ON public.activity_logs
    FOR ALL USING (public.is_admin());

-- Notifications Policies
DROP POLICY IF EXISTS "Users can manage their own notifications" ON public.notifications;
CREATE POLICY "Users can manage their own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can manage all notifications" ON public.notifications;
CREATE POLICY "Admin can manage all notifications" ON public.notifications
    FOR ALL USING (public.is_admin());

-- Payment Wallets, QR, and System Settings Singleton Policies
DROP POLICY IF EXISTS "Configs are readable by everyone" ON public.payment_config;
CREATE POLICY "Configs are readable by everyone" ON public.payment_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Admin can manage payment config" ON public.payment_config;
CREATE POLICY "Only Admin can manage payment config" ON public.payment_config FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "QR Configs are readable by everyone" ON public.qr_config;
CREATE POLICY "QR Configs are readable by everyone" ON public.qr_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Admin can manage QR config" ON public.qr_config;
CREATE POLICY "Only Admin can manage QR config" ON public.qr_config FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "System settings are readable by everyone" ON public.system_settings;
CREATE POLICY "System settings are readable by everyone" ON public.system_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only Admin can manage system settings" ON public.system_settings;
CREATE POLICY "Only Admin can manage system settings" ON public.system_settings FOR ALL USING (public.is_admin());


-- ============================================================================
-- 5. STORAGE BUCKETS FOR MEDIA (QR CODES AND COMPLIANCE DOCUMENTS)
-- ============================================================================
-- Create bucket for QR codes and verification documents
-- Must be executed via Supabase storage API or storage SQL UI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('musk-ledger-assets', 'musk-ledger-assets', true);

-- RLS for Storage Objects:
-- CREATE POLICY "Public read access to ledger assets" ON storage.objects FOR SELECT USING (bucket_id = 'musk-ledger-assets');
-- CREATE POLICY "Admins can upload ledger assets" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'musk-ledger-assets' AND public.is_admin());


-- ============================================================================
-- 6. ADVANCED PL/PGSQL TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to handle auto-creation of Public Profile upon Signup on Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, status, role, avatar_seed)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'New Investor'),
    new.email,
    new.raw_user_meta_data->>'phone',
    'Active',
    CASE 
      WHEN LOWER(new.email) IN ('kordacharityfoundation@gmail.com', 'admin@muskinvestment.com') THEN 'admin'::public.user_role_type
      ELSE 'user'::public.user_role_type
    END,
    'SEED_' || floor(random() * 10000)::text
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create welcome notification
  INSERT INTO public.notifications (user_id, user_email, title, message, type)
  VALUES (
    new.id,
    new.email,
    'Investor Node Certified',
    'Welcome to Musk Investments. Your asset-compounding node is fully synced and operational.',
    'general'
  )
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute upon registration (Dropped first to avoid already exists error)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();


-- Function to update modified timestamps on changes
CREATE OR REPLACE FUNCTION public.update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_timestamp ON public.profiles;
CREATE TRIGGER update_profiles_timestamp BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_modified_timestamp();

DROP TRIGGER IF EXISTS update_deposits_timestamp ON public.deposits;
CREATE TRIGGER update_deposits_timestamp BEFORE UPDATE ON public.deposits FOR EACH ROW EXECUTE FUNCTION public.update_modified_timestamp();

DROP TRIGGER IF EXISTS update_withdrawals_timestamp ON public.withdrawals;
CREATE TRIGGER update_withdrawals_timestamp BEFORE UPDATE ON public.withdrawals FOR EACH ROW EXECUTE FUNCTION public.update_modified_timestamp();

DROP TRIGGER IF EXISTS update_support_tickets_timestamp ON public.support_tickets;
CREATE TRIGGER update_support_tickets_timestamp BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_modified_timestamp();


-- ============================================================================
-- 7. INITIAL DATABASE SEED DATA
-- ============================================================================

-- A. Seed Investment Plans
INSERT INTO public.investment_plans (id, name, apr, min_deposit, duration, description, badge) VALUES
('plan-1', 'Boring Venture Node', 8.50, 1000.00, 30, 'Entry-level short commitment plan exploring automated high-yield tunneling & transit routing technology.', 'Starter'),
('plan-2', 'Optimus Kinetic Core', 10.00, 2000.00, 45, 'Harness autonomous robotic fleet energy grid allocations for robust daily compounded yields.', 'Robot Tech'),
('plan-3', 'Gigafactory Battery Power', 12.50, 3000.00, 60, 'Sustainable battery energy storage growth backed by global clean-energy Gigapack battery nodes.', 'Eco Yield'),
('plan-4', 'Hyperloop Pneumatic Ring', 14.00, 4000.00, 60, 'High velocity pneumatic pressure transit nodes for highly consistent short-term compounding.', 'Rapid Velocity'),
('plan-5', 'Falcon Heavy Rocket Thrust', 16.50, 5000.00, 90, 'Triple-booster rocket asset allocations optimized for steady orbital aerospace launch equity.', 'Launch Peak'),
('plan-6', 'Starlink Constellation Nexus', 19.00, 10000.00, 120, 'Low Earth Orbit orbital satellite global mesh networking yield, mapping continuous internet connectivity return.', 'Orbital Grid'),
('plan-7', 'Neuralink Synaptic Bridge', 22.00, 20000.00, 180, 'State-of-the-art cybernetic bio-digital brain interface technology nodes yielding peak technical dividends.', 'Brain Machine'),
('plan-8', 'Tesla Roadster Lunar Mode', 25.50, 30000.00, 180, 'Supercharged performance torque luxury electric sports car asset pools. High speed smart acceleration.', 'Torque Spec'),
('plan-9', 'xAI Colossus GPU Mesh', 28.00, 40000.00, 270, 'Ultra-scale high-performance intelligence compute model cluster sharing premium GPU computing returns.', 'Super Compute'),
('plan-10', 'Starship Interstellar Flight', 32.50, 50000.00, 365, 'Our absolute flagship deep space transport allocation for maximum long term tech compounding yields.', 'Deep Space')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  apr = EXCLUDED.apr,
  min_deposit = EXCLUDED.min_deposit,
  duration = EXCLUDED.duration,
  description = EXCLUDED.description,
  badge = EXCLUDED.badge;

-- B. Seed System Settings
INSERT INTO public.system_settings (id, website_name, support_email, support_phone, company_address, footer_text, maintenance_mode, registration_open, deposit_open, withdrawal_open, referral_program_open) VALUES
(1, 'Musk Investment', 'support@muskinvestment.com', '+1 (800) 555-MUSK', 'Starbase Launch Facility, Boca Chica, Texas, USA', '© 2026 Musk Investment. Designed for professional staking and high-throughput technological asset compounding. Backed by automated aerospace energy allocation pools.', false, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- C. Seed Payment Configurations
INSERT INTO public.payment_config (id, bank_name, account_name, account_number, routing_number, btc_address, usdt_trc_address, usdt_erc_address) VALUES
(1, 'Starbase Galactic Credit Union', 'Musk Investment Corp', '184-7392-1029', '021000021', '1MuSk77vXz8S8VPrAdAr8S73v48yPnC9E9', 'TX9MuSkTRC20PlAtForMe198473210vY9s', '0x9a7bMuSkERC20F000de739D7Fbe41983021')
ON CONFLICT (id) DO NOTHING;

-- D. Seed QR Code Placeholders
INSERT INTO public.qr_config (id, btc_qr, usdt_trc_qr, usdt_erc_qr, bank_qr) VALUES
(1, 'default_btc', 'default_trc', 'default_erc', 'default_bank')
ON CONFLICT (id) DO NOTHING;

-- E. Seed System Announcements (Only if they don't already exist)
INSERT INTO public.announcements (text, category)
SELECT 'Bitcoin deposit address has been optimized. Please verify the new address before initiating transfers.', 'Update'::announcement_category_type
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE text = 'Bitcoin deposit address has been optimized. Please verify the new address before initiating transfers.');

INSERT INTO public.announcements (text, category)
SELECT 'Weekly network security audit completed. All node escrow deposits successfully validated on the secure ledger.', 'General'::announcement_category_type
WHERE NOT EXISTS (SELECT 1 FROM public.announcements WHERE text = 'Weekly network security audit completed. All node escrow deposits successfully validated on the secure ledger.');

-- ============================================================================
-- END OF MIGRATION SETUP
-- ============================================================================
