export function convertToBase64(iconString: string) {
	try {
		return btoa(iconString);
	} catch (err) {
		return Buffer.from(iconString).toString('base64');
	}
}