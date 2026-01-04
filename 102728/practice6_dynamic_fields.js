const form=document.getElementById('dynamic-form');
const list=document.getElementById('participant-list');
const addBtn=document.getElementById('add-participant');
const submitBtn=document.getElementById('submit-btn');
const resetBtn=document.getElementById('reset-btn');
const countLabel=document.getElementById('count');
const maxParticipants=5;
let participantIndex=0;
function createParticipantCard(){
  const index=participantIndex++;
  const wrapper=document.createElement('div');
  wrapper.className='participant card border-0 shadow-sm';
  wrapper.dataset.index=String(index);
  wrapper.innerHTML=
    '<div class="card-body">'+
      '<div class="d-flex justify-content-between align-items-start mb-3">'+
        '<h5 class="card-title mb-0">參與者 '+(index+1)+'</h5>'+
        '<button type="button" class="btn btn-sm btn-outline-danger" data-action="remove">移除</button>'+
      '</div>'+
      '<div class="mb-3">'+
        '<label class="form-label" for="name-'+index+'">姓名</label>'+
        '<input id="name-'+index+'" name="name-'+index+'" class="form-control" type="text" required aria-describedby="name-'+index+'-error">'+
        '<p id="name-'+index+'-error" class="text-danger small mb-0" aria-live="polite"></p>'+
      '</div>'+
      '<div class="mb-0">'+
        '<label class="form-label" for="email-'+index+'">Email</label>'+
        '<input id="email-'+index+'" name="email-'+index+'" class="form-control" type="email" required aria-describedby="email-'+index+'-error" inputmode="email">'+
        '<p id="email-'+index+'-error" class="text-danger small mb-0" aria-live="polite"></p>'+
      '</div>'+
    '</div>';
  return wrapper;
}
function updateCount(){
  countLabel.textContent=String(list.children.length);
  addBtn.disabled=list.children.length>=maxParticipants;
}
function setError(inputElement,message){
  const errorElement=document.getElementById(inputElement.id+'-error');
  inputElement.setCustomValidity(message);
  if(errorElement){errorElement.textContent=message;}
  if(message){inputElement.classList.add('is-invalid');}else{inputElement.classList.remove('is-invalid');}
}
function validateInput(inputElement){
  const value=inputElement.value.trim();
  if(!value){setError(inputElement,'此欄位必填');return false;}
  if(inputElement.type==='email'){
    const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailPattern.test(value)){setError(inputElement,'Email 格式不正確');return false;}
  }
  setError(inputElement,'');
  return true;
}
function handleAddParticipant(){
  if(list.children.length>=maxParticipants){return;}
  const participant=createParticipantCard();
  list.appendChild(participant);
  updateCount();
  const firstInput=participant.querySelector('input');
  if(firstInput){firstInput.focus();}
}
addBtn.addEventListener('click',handleAddParticipant);
list.addEventListener('click',e=>{
  const button=e.target.closest('[data-action="remove"]');
  if(!button){return;}
  const participant=button.closest('.participant');
  if(participant){participant.remove();}
  updateCount();
});
list.addEventListener('blur',e=>{
  if(e.target.matches('input')){validateInput(e.target);}
},true);
list.addEventListener('input',e=>{
  if(e.target.matches('input')){
    if(e.target.validationMessage){validateInput(e.target);}
  }
});
form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(list.children.length===0){
    alert('請至少新增一位參與者');
    handleAddParticipant();
    return;
  }
  let firstInvalid=null;
  list.querySelectorAll('input').forEach(input=>{
    const ok=validateInput(input);
    if(!ok&&!firstInvalid){firstInvalid=input;}
  });
  if(firstInvalid){firstInvalid.focus();return;}
  submitBtn.disabled=true;
  submitBtn.textContent='送出中...';
  await new Promise(r=>setTimeout(r,1000));
  alert('表單已送出');
  form.reset();
  list.innerHTML='';
  participantIndex=0;
  updateCount();
  submitBtn.disabled=false;
  submitBtn.textContent='送出';
});
resetBtn.addEventListener('click',()=>{
  form.reset();
  list.innerHTML='';
  participantIndex=0;
  updateCount();
});
handleAddParticipant();
