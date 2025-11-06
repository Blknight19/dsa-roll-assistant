export const resetLocalStorage = () => {
	localStorage.removeItem('dsa-app-state');
	location.reload();
};