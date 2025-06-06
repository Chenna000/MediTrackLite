export function saveUserToLocalStorage(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUserFromLocalStorage() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export const clearUserFromLocalStorage = () => {
  localStorage.removeItem('user');
};