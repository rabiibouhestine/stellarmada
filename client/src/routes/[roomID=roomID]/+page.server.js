import { redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
    const { userID } = await parent();
    const joinParams = new URLSearchParams({
        roomID: params.roomID,
        userID: userID
    });
    const response = await fetch(`http://localhost:3001/join?${joinParams.toString()}`);
    if (response.ok) {
        const responseData = await response.json();

        return {
            userID: userID,
            gameStarted: responseData.gameStarted,
            playersNb: responseData.playersNb,
            isBotRoom: responseData.isBotRoom
        };
    } else {
        throw redirect(308, '/');
    }
}
