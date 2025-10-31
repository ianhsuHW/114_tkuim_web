const form=document.getElementById('full-form');
const submitBtn=document.getElementById('submitBtn');
const resetBtn=document.getElementById('resetBtn');
function validateAllInputs(formElement){
  let firstInvalid=null;
  const controls=Array.from(formElement.querySelectorAll('input, select, textarea'));
  controls.forEach(control=>{
    control.classList.remove('is-invalid');
    if(!control.checkValidity()){
      control.classList.add('is-invalid');
      if(!firstInvalid){firstInvalid=control;}
    }
  });
  return firstInvalid;
}
form.addEventListener('submit',async e=>{
  e.preventDefault();
  submitBtn.disabled=true;
  submitBtn.textContent='送出中...';
  const firstInvalid=validateAllInputs(form);
  if(firstInvalid){
    submitBtn.disabled=false;
    submitBtn.textContent='送出';
    firstInvalid.focus();
    return;
  }
  await new Promise(r=>setTimeout(r,1000));
  alert('資料已送出，感謝您的聯絡');
  form.reset();
  submitBtn.disabled=false;
  submitBtn.textContent='送出';
});
resetBtn.addEventListener('click',()=>{
  form.reset();
  Array.from(form.elements).forEach(el=>{el.classList.remove('is-invalid');});
});
form.addEventListener('input',e=>{
  const target=e.target;
  if(target.classList.contains('is-invalid')&&target.checkValidity()){
    target.classList.remove('is-invalid');
  }
});
