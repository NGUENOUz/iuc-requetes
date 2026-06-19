// Test API Login
// Copiez et collez ce code dans la console du navigateur sur http://localhost:3000

async function testLoginAPI() {
  console.log('=== TEST API LOGIN ===\n');
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'admin@iuc.edu',
        password: 'votre_mot_de_passe_ici' // Remplacez par le vrai mot de passe
      })
    });
    
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    console.log('\nFull response data:', data);
    console.log('\nData structure:');
    console.log('  data.success:', data.success);
    console.log('  data.data:', data.data);
    console.log('  data.data.user:', data.data?.user);
    console.log('  data.data.user.role:', data.data?.user?.role);
    console.log('  data.data.user.role.name:', data.data?.user?.role?.name);
    
    if (data.success && data.data?.user?.role?.name) {
      const roleName = data.data.user.role.name;
      const role = roleName.toLowerCase().trim();
      
      console.log('\n=== REDIRECTION TEST ===');
      console.log('Role name from API:', roleName);
      console.log('Role after processing:', role);
      
      if (role === 'admin' || role === 'administrateur') {
        console.log('✅ Should redirect to: /admin');
      } else {
        console.log('✅ Should redirect to: /dashboard');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Exécuter le test
testLoginAPI();
