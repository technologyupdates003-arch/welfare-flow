// Simple script to create Laban using the working API
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase URL and service role key
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_SERVICE_ROLE_KEY = 'your-service-role-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createLaban() {
  try {
    // Use the same logic as the create-member function
    const phone = '0720580859';
    const password = 'Laban@26';
    const name = 'LABAN PANDA KHISA';
    
    const normalizedPhone = phone.startsWith("+254") ? phone : `+254${phone.replace(/^0/, "")}`;
    const email = `${normalizedPhone.replace("+", "")}@welfare.local`;

    console.log('Creating user with:');
    console.log('Phone:', normalizedPhone);
    console.log('Email:', email);
    console.log('Password:', password);

    // Create auth user using admin API
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email, 
      password, 
      email_confirm: true,
    });

    if (authErr) {
      console.error('Auth error:', authErr);
      return;
    }

    console.log('Auth user created:', authData.user.id);

    // Create member record
    const { error: memberErr } = await supabase.from("members").insert({
      name, 
      phone: normalizedPhone, 
      member_id: '32580859',
      user_id: authData.user.id,
    });

    if (memberErr) {
      console.error('Member error:', memberErr);
      return;
    }

    // Assign member role
    const { error: roleErr } = await supabase.from("user_roles").insert({
      user_id: authData.user.id, 
      role: "member",
    });

    if (roleErr) {
      console.error('Role error:', roleErr);
      return;
    }

    console.log('SUCCESS! Laban created:');
    console.log('Login phone:', phone, 'or', normalizedPhone);
    console.log('Password:', password);
    console.log('Member ID: 32580859');

  } catch (error) {
    console.error('Error:', error);
  }
}

createLaban();