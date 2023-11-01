
export async function load({ cookies }) {
    if (!cookies.get('playerID')) {
        cookies.set('playerID', 'playerID', { path: '/' })
    }
}
