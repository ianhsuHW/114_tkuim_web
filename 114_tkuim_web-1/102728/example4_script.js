const form=document.getElementById('access-form');
const fieldName={input:document.getElementById('name'),error:document.getElementById('name-error')};
const fieldAge={input:document.getElementById('age'),error:document.getElementById('age-error')};
const fields=[fieldName,fieldAge];
function validateField(field){
  const input=field.input;
  const error=field.error;
  let message='';
  if(input.validity.valueMissing){message='此欄位為必填。';}
  else if(input.validity.rangeUnderflow||input.validity.rangeOverflow){message=`請輸入 ${input.min} 到 ${input.max} 之間的數字。`;}
  input.setCustomValidity(message);
  error.textContent=message;
  return !message;
}
fields.forEach(field=>{
  field.input.addEventListener('input',()=>{
    if(field.input.validationMessage){validateField(field);}
  });
  field.input.addEventListener('blur',()=>{validateField(field);});
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  let firstInvalid=null;
  fields.forEach(field=>{
    const ok=validateField(field);
    if(!ok&&!firstInvalid){firstInvalid=field.input;}
  });
  if(firstInvalid){firstInvalid.focus();return;}
  alert('表單送出成功');
  form.reset();
  fields.forEach(f=>{f.error.textContent='';});
});
