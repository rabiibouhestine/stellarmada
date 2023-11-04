export function match(param) {
	return /^[A-Za-z0-9]{1,12}$/.test(param);
}