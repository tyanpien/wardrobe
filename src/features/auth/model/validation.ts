export function validateName(name: string): string {
    if (!name.trim()) {
      return "Введите имя";
    }
  
    if (name.trim().length < 2) {
      return "Имя должно содержать не менее 2 символов";
    }
  
    return "";
  }
  
  export function validateEmail(email: string): string {
    if (!email.trim()) {
      return "Введите корректный e-mail";
    }
  
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailPattern.test(email.trim())) {
      return "Введите корректный e-mail";
    }
  
    return "";
  }
  
  export function validatePassword(password: string): string {
    if (!password) {
      return "Введите пароль";
    }
  
    if (password.length < 8) {
      return "Пароль должен содержать не менее 8 символов";
    }
  
    return "";
  }