/**
 * Test UUID generation to ensure it works correctly before deployment
 */

// Copy the UUID generation function from the seeding script
function generateSeededUUID(seed) {
  // Create a simple hash from the seed string and convert to UUID format
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive number and pad
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  const seed2 = seed.split('').reverse().join('');
  let hash2 = 0;
  for (let i = 0; i < seed2.length; i++) {
    const char = seed2.charCodeAt(i);
    hash2 = ((hash2 << 5) - hash2) + char;
    hash2 = hash2 & hash2;
  }
  const positiveHash2 = Math.abs(hash2).toString(16).padStart(8, '0');
  
  // Format as UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return `${positiveHash.slice(0,8)}-${positiveHash.slice(0,4)}-4${positiveHash.slice(1,4)}-8${positiveHash2.slice(0,3)}-${positiveHash2.padStart(12, '0').slice(0,12)}`;
}

// Validate UUID format
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Test the UUID generation
console.log('🧪 Testing UUID Generation\n');

const testSeeds = [
  'source-techcrunch',
  'tag-technology',
  'factoid-nvidia-ai-chip-2024',
  'content-factoid-nvidia-source-techcrunch'
];

console.log('🔍 Generated UUIDs:');
testSeeds.forEach(seed => {
  const uuid = generateSeededUUID(seed);
  const isValid = isValidUUID(uuid);
  console.log(`${seed.padEnd(35)} → ${uuid} ${isValid ? '✅' : '❌'}`);
  
  if (!isValid) {
    console.error(`❌ Invalid UUID generated for seed: ${seed}`);
  }
});

// Test consistency (same seed should generate same UUID)
console.log('\n🔄 Testing consistency:');
const testSeed = 'source-techcrunch';
const uuid1 = generateSeededUUID(testSeed);
const uuid2 = generateSeededUUID(testSeed);
const isConsistent = uuid1 === uuid2;
console.log(`Same seed generates same UUID: ${isConsistent ? '✅' : '❌'}`);
console.log(`UUID 1: ${uuid1}`);
console.log(`UUID 2: ${uuid2}`);

// Test uniqueness (different seeds should generate different UUIDs)
console.log('\n🎯 Testing uniqueness:');
const seeds = ['test1', 'test2', 'test3'];
const uuids = seeds.map(seed => generateSeededUUID(seed));
const uniqueUUIDs = new Set(uuids);
const isUnique = uniqueUUIDs.size === uuids.length;
console.log(`Different seeds generate different UUIDs: ${isUnique ? '✅' : '❌'}`);
uuids.forEach((uuid, index) => {
  console.log(`${seeds[index]} → ${uuid}`);
});

// Generate the actual UUIDs that will be used in deployment
console.log('\n📊 Deployment UUIDs Preview:');

const sourceNames = ['techcrunch', 'reuters', 'theverge', 'bloomberg', 'ynet'];
const tagNames = ['technology', 'ai', 'hardware', 'finance', 'economy', 'space', 'environment', 'israel', 'startups'];
const factoidNames = ['nvidia', 'fed', 'spacex', 'cop28', 'israel_tech'];

console.log('\nSources:');
sourceNames.forEach(name => {
  const uuid = generateSeededUUID(`source-${name}`);
  console.log(`${name.padEnd(12)} → ${uuid}`);
});

console.log('\nTags:');
tagNames.forEach(name => {
  const uuid = generateSeededUUID(`tag-${name}`);
  console.log(`${name.padEnd(12)} → ${uuid}`);
});

console.log('\nFactoids:');
factoidNames.forEach(name => {
  const uuid = generateSeededUUID(`factoid-${name}-2024`);
  console.log(`${name.padEnd(12)} → ${uuid}`);
});

console.log('\n🎉 UUID generation test completed!');

// Final validation
const allTestUUIDs = [
  ...sourceNames.map(name => generateSeededUUID(`source-${name}`)),
  ...tagNames.map(name => generateSeededUUID(`tag-${name}`)),
  ...factoidNames.map(name => generateSeededUUID(`factoid-${name}-2024`))
];

const allValid = allTestUUIDs.every(uuid => isValidUUID(uuid));
const allUnique = new Set(allTestUUIDs).size === allTestUUIDs.length;

console.log(`\n✅ Final Validation:`);
console.log(`   All UUIDs valid: ${allValid ? '✅' : '❌'}`);
console.log(`   All UUIDs unique: ${allUnique ? '✅' : '❌'}`);
console.log(`   Total UUIDs generated: ${allTestUUIDs.length}`);

if (allValid && allUnique) {
  console.log('\n🎉 Ready for deployment!');
} else {
  console.log('\n❌ UUID generation has issues. Do not deploy.');
  process.exit(1);
} 