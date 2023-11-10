import { redirect } from '@sveltejs/kit';

export async function load({ params, parent }) {
    const { userID } = await parent();
    const joinParams = new URLSearchParams({
        roomID: params.roomID,
        userID: userID
    });
    const response = await fetch(`https://server.stellarmada.com/join?${joinParams.toString()}`);
    if (response.ok) {
        const responseData = await response.json();

        return {
            userID: userID,
            gameStarted: responseData.gameStarted,
            playersNb: responseData.playersNb,
            isBotRoom: responseData.isBotRoom,
            isCreated: responseData.isCreated
        };
    } else {
        throw redirect(308, '/');
    }
}
