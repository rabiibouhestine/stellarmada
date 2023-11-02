import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
    const joinParams = new URLSearchParams({
        roomID: params.roomID
    });
    const response = await fetch(`http://localhost:3001/join?${joinParams.toString()}`);
    if (response.ok) {
        const responseData = await response.json();
        const gameStarted = await responseData.gameStarted;
        return {
                gameStarted: gameStarted
        };
    } else {
        throw redirect(308, '/');
    }
}
