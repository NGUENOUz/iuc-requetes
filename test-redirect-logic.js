// Test de la logique de redirection
// Exécutez ce fichier dans la console du navigateur pour tester

const testRedirect = (roleName) => {
  console.log('Testing with roleName:', roleName);
  const role = roleName?.toLowerCase().trim();
  console.log('Role after processing:', role);
  
  if (role === 'admin' || role === 'administrateur') {
    console.log('✅ Should redirect to /admin');
    return '/admin';
  } else {
    console.log('✅ Should redirect to /dashboard');
    return '/dashboard';
  }
};

// Tests
console.log('=== TEST DE REDIRECTION ===');
console.log('\nTest 1 - "admin":', testRedirect('admin'));
console.log('\nTest 2 - "Admin":', testRedirect('Admin'));
console.log('\nTest 3 - "ADMIN":', testRedirect('ADMIN'));
console.log('\nTest 4 - "administrateur":', testRedirect('administrateur'));
console.log('\nTest 5 - "etudiant":', testRedirect('etudiant'));
console.log('\nTest 6 - "agent":', testRedirect('agent'));
