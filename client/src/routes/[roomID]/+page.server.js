import { redirect } from '@sveltejs/kit';

export async function load({ cookies, params }) {
    const joinParams = new URLSearchParams({
        playerID: cookies.get('playerID'),
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
