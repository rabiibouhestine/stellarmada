import { redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
    const joinParams = new URLSearchParams({
        roomID: params.roomID,
        userID: await parent()
    });
    const response = await fetch(`http://localhost:3001/join?${joinParams.toString()}`);
    if (response.ok) {
        const responseData = await response.json();

        return {
            gameStarted: responseData.gameStarted,
            playersNb: responseData.playersNb
        };
    } else {
        throw redirect(308, '/');
    }
}
