
// Frontend logic with backend fallback
const API_BASE = '/api'; // when running server, this will work. If not, fallback to local data.

let backendAvailable = false;

async function checkBackend(){
  try{
    const r = await fetch(API_BASE + '/ping');
    if(r.ok) backendAvailable = true;
  }catch(e){
    backendAvailable = false;
  }
}

const donors_fallback = [
  {id:1,name:"Ravi Kumar",blood:"A+",pincode:"474001",lastDonatedDays:120,verified:1,phone:"+91-9000000001"},
  {id:2,name:"Sana Patel",blood:"O+",pincode:"474001",lastDonatedDays:60,verified:1,phone:"+91-9000000002"},
  {id:3,name:"Aman Singh",blood:"B+",pincode:"474002",lastDonatedDays:200,verified:0,phone:"+91-9000000003"},
  {id:4,name:"Priya Sharma",blood:"A+",pincode:"474003",lastDonatedDays:40,verified:1,phone:"+91-9000000004"},
  {id:5,name:"Deepak Joshi",blood:"AB+",pincode:"474001",lastDonatedDays:90,verified:1,phone:"+91-9000000005"},
  {id:6,name:"Neha Verma",blood:"O-",pincode:"474002",lastDonatedDays:120,verified:1,phone:"+91-9000000006"},
  {id:7,name:"Karan Mehta",blood:"B-",pincode:"474003",lastDonatedDays:75,verified:1,phone:"+91-9000000007"}
];

const listEl = document.getElementById('list');
const noResults = document.getElementById('noResults');
const searchBtn = document.getElementById('searchBtn');
const bloodSelect = document.getElementById('bloodGroup');
const pincodeInput = document.getElementById('pincode');

function renderDonorCard(d){
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    <h4>${d.name} <span class="badge">${d.blood}</span></h4>
    <div class="small">Pincode: ${d.pincode} • Last donated: ${d.lastDonatedDays} days ago</div>
    <div class="small">Verified: ${d.verified ? 'Yes' : 'No'}</div>
    <p style="margin-top:8px"><button class="reqBtn" data-id="${d.id}">Request Now</button></p>
  `;
  // tilt effect
  div.addEventListener('mousemove', (e)=>{
    const rect = div.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    div.style.transform = `rotateX(${ -y * 6 }deg) rotateY(${ x * 6 }deg) translateZ(0)`;
    div.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)';
  });
  div.addEventListener('mouseleave', ()=>{
    div.style.transform = '';
    div.style.boxShadow = '';
  });
  return div;
}

function showResults(results){
  listEl.innerHTML = '';
  if(results.length===0){
    noResults.style.display = 'block';
    document.getElementById('statDonors').innerText = 0;
    return;
  }
  noResults.style.display = 'none';
  results.forEach(r=> listEl.appendChild(renderDonorCard(r)));
  // attach event
  document.querySelectorAll('.reqBtn').forEach(btn=> btn.addEventListener('click', openRequestModal));
  document.getElementById('statDonors').innerText = results.length;
}

function filterLocal(donors, blood, pincode){
  return donors.filter(d=>{
    if(blood && d.blood !== blood) return false;
    if(pincode && d.pincode !== pincode) return false;
    return d.verified; // show only verified in demo
  });
}

searchBtn.addEventListener('click', async ()=>{
  const blood = bloodSelect.value;
  const pincode = pincodeInput.value.trim();
  // try backend
  if(backendAvailable){
    try{
      const res = await fetch(API_BASE + '/donors?blood=' + encodeURIComponent(blood) + '&pincode=' + encodeURIComponent(pincode));
      if(res.ok){
        const data = await res.json();
        showResults(data);
        return;
      }
    }catch(e){ /* fallback */ }
  }
  // fallback local
  const results = filterLocal(donors_fallback, blood, pincode);
  showResults(results);
});

// modal logic (similar to previous)
const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const reqForm = document.getElementById('requestForm');
const reqBlood = document.getElementById('reqBlood');
const requestResult = document.getElementById('requestResult');

function openRequestModal(e){
  const id = e.target.dataset.id;
  // try backend donor lookup
  if(backendAvailable){
    fetch(API_BASE + '/donors/' + id).then(r=>r.json()).then(donor=>{
      reqBlood.value = donor.blood + ' — donor: ' + donor.name;
      modal.style.display = 'flex';
    }).catch(()=>{
      const donor = donors_fallback.find(x=>x.id==id);
      reqBlood.value = donor.blood + ' — donor: ' + donor.name;
      modal.style.display = 'flex';
    });
  } else {
    const donor = donors_fallback.find(x=>x.id==id);
    reqBlood.value = donor.blood + ' — donor: ' + donor.name;
    modal.style.display = 'flex';
  }
}

closeModal.addEventListener('click', ()=>{ modal.style.display='none'; });

reqForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const name = document.getElementById('reqName').value.trim();
  const phone = document.getElementById('reqPhone').value.trim();
  const pincode = document.getElementById('reqPincode').value.trim();
  const blood = document.getElementById('reqBlood').value;
  const agree = document.getElementById('agree').checked;
  if(!name || !phone || !pincode || !agree){ alert('Please fill all fields and confirm emergency.'); return; }
  // send to backend if available
  if(backendAvailable){
    try{
      const res = await fetch(API_BASE + '/requests', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,phone,pincode,blood})});
      if(res.ok){
        const j = await res.json();
        requestResult.style.display = 'block';
        requestResult.innerHTML = `<div class="info">Request saved. Request ID: <strong>${j.requestId}</strong>. Estimated delivery: <strong>${j.eta} minutes</strong>.</div>`;
        document.getElementById('statReq').innerText = j.totalRequests || '-';
        return;
      }
    }catch(e){ /* fallback */ }
  }
  // fallback simulation
  const eta = Math.floor(Math.random()*60)+30;
  requestResult.style.display = 'block';
  requestResult.innerHTML = `<div class="info">Request simulated. ETA: <strong>${eta} minutes</strong>. Someone will contact you on <strong>${phone}</strong>.</div>`;
  const current = parseInt(document.getElementById('statReq').innerText || '0') || 0;
  document.getElementById('statReq').innerText = current + 1;
});

// initial check for backend
checkBackend().then(()=>console.log('backendAvailable=', backendAvailable));
