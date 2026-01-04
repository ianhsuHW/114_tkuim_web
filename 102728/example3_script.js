const form=document.getElementById('signup-form');
const password=document.getElementById('password');
const confirmPassword=document.getElementById('confirm');
const passwordError=document.getElementById('password-error');
const confirmError=document.getElementById('confirm-error');
const touched=new Set();
function validatePassword(){
  const value=password.value.trim();
  const hasLetter=/[A-Za-z]/.test(value);
  const hasNumber=/\d/.test(value);
  let message='';
  if(!value){message='請輸入密碼。';}
  else if(value.length<8){message='密碼至少需 8 碼。';}
  else if(!hasLetter||!hasNumber){message='請同時包含英文字母與數字。';}
  password.setCustomValidity(message);
  passwordError.textContent=message;
  return !message;
}
function validateConfirm(){
  const pv=password.value.trim();
  const cv=confirmPassword.value.trim();
  let message='';
  if(!cv){message='請再次輸入密碼。';}
  else if(pv!==cv){message='兩次輸入的密碼不一致。';}
  confirmPassword.setCustomValidity(message);
  confirmError.textContent=message;
  return !message;
}
function handleBlur(e){
  touched.add(e.target.id);
  runValidation(e.target.id);
}
function handleInput(e){
  if(!touched.has(e.target.id))return;
  runValidation(e.target.id);
}
function runValidation(id){
  if(id==='password'){
    validatePassword();
    if(touched.has('confirm')){validateConfirm();}
  }
  if(id==='confirm'){validateConfirm();}
}
[password,confirmPassword].forEach(i=>{
  i.addEventListener('blur',handleBlur);
  i.addEventListener('input',handleInput);
});
form.addEventListener('submit',e=>{
  e.preventDefault();
  touched.add('password');
  touched.add('confirm');
  const ok1=validatePassword();
  const ok2=validateConfirm();
  if(ok1&&ok2){
    alert('註冊成功');
    form.reset();
    passwordError.textContent='';
    confirmError.textContent='';
    touched.clear();
  }
});
