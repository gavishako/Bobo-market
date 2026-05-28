// Diagnostic script to check Supabase RLS policies and table structure
// Run this in the browser console to debug

(async () => {
  console.log("🔍 Supabase Diagnostic Check...\n");

  const supabaseUrl = "https://wyhvgfxwpadjsiodwsok.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aHZnZnh3cGFkanNpb2R3c29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzY2MjQsImV4cCI6MjA5NDc1MjYyNH0.BXdfZJGXCqJKPQHEZP8MUdpjlNbbAo5nAqbn1r17qFU";

  // Test 1: Check if product_images table is readable
  console.log("✓ Test 1: Checking product_images table access...");
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/product_images?limit=1`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      }
    });
    console.log(`  Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`  Data:`, data);
  } catch (e) {
    console.error(`  Error: ${e.message}`);
  }

  // Test 2: Check products table
  console.log("\n✓ Test 2: Checking products table access...");
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/products?limit=1`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      }
    });
    console.log(`  Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`  Data count: ${Array.isArray(data) ? data.length : 'N/A'}`);
  } catch (e) {
    console.error(`  Error: ${e.message}`);
  }

  // Test 3: Check user_roles
  console.log("\n✓ Test 3: Checking user_roles table access...");
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user_roles?limit=5`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
      }
    });
    console.log(`  Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log(`  Data count: ${Array.isArray(data) ? data.length : 'N/A'}`);
  } catch (e) {
    console.error(`  Error: ${e.message}`);
  }

  console.log("\n✅ Diagnostic check complete!");
})();
