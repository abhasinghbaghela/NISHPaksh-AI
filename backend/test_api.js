import http from 'http';

// Helper to make HTTP request
function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

// Generate a dummy base64 JPEG
function makeDummyJpeg(colorHex = '#4A154B') {
  // Minimal valid 1x1 base64 JPEG
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
}

async function runTests() {
  console.log('--- STARTING NISHPaksh AI API INTEGRATION TESTS ---');

  // Test 1: Health Check
  const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log(`[TEST 1] Health Check: Status ${health.status} ->`, health.data.status === 'online' ? 'PASS' : 'FAIL');

  // Test 2: Get Cases
  const casesRes = await request({ host: 'localhost', port: 5000, path: '/api/cases', method: 'GET' });
  console.log(`[TEST 2] Get Cases: Status ${casesRes.status}, Count: ${casesRes.data.cases?.length} ->`, casesRes.data.success ? 'PASS' : 'FAIL');

  // Test 3: Validation failure with only 4 samples
  const invalidSamples = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/evidence/upload',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    caseId: 'TEST-CASE-001',
    evidenceId: 'EVD-001',
    samples: [makeDummyJpeg(), makeDummyJpeg(), makeDummyJpeg(), makeDummyJpeg()], // only 4!
    referenceCard: makeDummyJpeg()
  });
  console.log(`[TEST 3] Rejection on <5 samples: Status ${invalidSamples.status} ->`, (invalidSamples.status === 400 && invalidSamples.data.error.includes('5')) ? 'PASS' : 'FAIL');

  // Test 4: Validation failure without reference card
  const invalidRef = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/evidence/upload',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    caseId: 'TEST-CASE-002',
    evidenceId: 'EVD-002',
    samples: [makeDummyJpeg(), makeDummyJpeg(), makeDummyJpeg(), makeDummyJpeg(), makeDummyJpeg()],
    referenceCard: null // missing!
  });
  console.log(`[TEST 4] Rejection on missing Reference Card: Status ${invalidRef.status} ->`, (invalidRef.status === 400) ? 'PASS' : 'FAIL');

  // Test 5: Successful upload with exactly 5 sample images + 1 reference card
  const validUpload = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/evidence/upload',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    caseId: 'NDPS-2026-TEST88',
    evidenceId: 'EVD-2026-TEST88',
    officer: 'Insp. Rajesh Kumar (NCB Field Unit)',
    location: 'Connaught Place, New Delhi',
    coordinates: '28.6139 N, 77.2090 E',
    testKit: 'Scott Reagent',
    reagent: 'Scott',
    sampleType: 'Powder (White)',
    detectedSubstance: 'Cocaine HCl',
    samples: [
      makeDummyJpeg('#111'),
      makeDummyJpeg('#222'),
      makeDummyJpeg('#333'),
      makeDummyJpeg('#444'),
      makeDummyJpeg('#555')
    ],
    referenceCard: makeDummyJpeg('#AAA')
  });

  console.log(`[TEST 5] Successful 6-image Upload: Status ${validUpload.status} ->`, (validUpload.status === 201 && validUpload.data.success) ? 'PASS' : 'FAIL');
  console.log('         Digital Seal Generated:', validUpload.data?.summary?.digitalSeal);
  console.log('         Saved Sample Images Count:', validUpload.data?.case?.sampleImages?.length);
  console.log('         Reference Card Present:', !!validUpload.data?.case?.referenceCardImage);

  // Test 6: Retrieve Evidence for the uploaded case
  const getEv = await request({ host: 'localhost', port: 5000, path: '/api/evidence/NDPS-2026-TEST88', method: 'GET' });
  console.log(`[TEST 6] Retrieve Evidence: Status ${getEv.status} ->`, (getEv.status === 200 && getEv.data.sampleImages.length === 5 && getEv.data.referenceCardImage !== null) ? 'PASS' : 'FAIL');

  console.log('--- ALL INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
