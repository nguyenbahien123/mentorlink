/**
 * Migration Script - Clean Old Token Storage
 * Run this in browser console AFTER deploying new code
 * 
 * Purpose: Remove old localStorage tokens from users' browsers
 */

(function() {
  console.log('🧹 Starting token migration cleanup...\n');
  
  let removedCount = 0;
  
  // List of old token keys to remove
  const oldTokenKeys = [
    'accessToken',
    'refreshToken',
    'authState',
    'token',
    'auth-token',
    'jwt-token'
  ];
  
  // Check and remove each key
  oldTokenKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      localStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
      removedCount++;
    }
  });
  
  // Show summary
  console.log('\n📊 Cleanup Summary:');
  console.log(`   Removed: ${removedCount} old token(s)`);
  
  // Verify cleanup
  console.log('\n🔍 Verification:');
  const stillExists = oldTokenKeys.filter(key => localStorage.getItem(key) !== null);
  
  if (stillExists.length === 0) {
    console.log('   ✅ All old tokens removed successfully');
    console.log('\n✨ Migration cleanup complete!');
    console.log('   Please LOGOUT and LOGIN again to use new secure system.\n');
    
    // Optional: Auto-redirect to logout
    const autoLogout = confirm('Do you want to logout now to complete migration?');
    if (autoLogout) {
      console.log('   Redirecting to logout...');
      setTimeout(() => {
        window.location.href = '/logout';
      }, 1000);
    }
  } else {
    console.warn('   ⚠️ Some tokens still exist:', stillExists);
  }
  
})();

// Alternative: Add to application startup
// Add this to your main.jsx or App.jsx:

/*
useEffect(() => {
  // Migration: Clean old localStorage tokens on first load
  const migrationDone = localStorage.getItem('token-migration-v2');
  
  if (!migrationDone) {
    console.log('🧹 Running token migration cleanup...');
    
    ['accessToken', 'refreshToken', 'authState'].forEach(key => {
      localStorage.removeItem(key);
    });
    
    localStorage.setItem('token-migration-v2', 'done');
    console.log('✅ Migration complete');
  }
}, []);
*/
