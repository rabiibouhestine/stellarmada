import { redirect } from '@sveltejs/kit';

export async function load({ params }) {
    const joinParams = new URLSearchParams({
        roomID: params.roomID
    });
    const response = await fetch(`http://localhost:3001/join?${joinParams.toString()}`);
    if (response.ok) {
      const gameStarted = await response.json();
      return {
        gameStarted: { gameStarted }
      };
    } else {
      throw redirect(308, '/');
    }
}
