<script>
	import { goto } from '$app/navigation';

	const goHome = () => {
		goto('/');
	};
</script>

<div class="max-h-screen overflow-auto bg-gradient-to-t from-apollo-blue-500 to-black">
	<div class="max-w-screen-xl mx-auto grid grid-cols-12 gap-x-2 my-10 px-4">
		<div class="col-span-1">
			<button
				class="w-full h-14 sticky top-10 p-4 rounded-lg bg-white bg-opacity-5 hover:bg-apollo-blue-400 font-black text-lg text-white"
				on:click={goHome}
			>
				QUIT
			</button>
		</div>
		<div class="col-span-10 p-8 bg-white bg-opacity-5 rounded-lg">
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">AIM OF THE GAME</h1>
			<p class="text-slate-400">The aim of the game is to defeat the other player.</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">SETUP</h1>
			<p class="text-slate-400">
				Prepare the Castle deck similarly to a standard game of Regicide:
			</p>
			<ul class="text-slate-500">
				<li>- Shuffle the 4 Kings and put them facedown on the table.</li>
				<li>- Shuffle the 4 Queens and add them facedown on top of the Kings.</li>
				<li>
					- Shuffle the 4 Jacks and add them facedown on top of the Queens. Do not reveal the first
					card. The Jester cards are not used. Shuffle the remaining cards and set them facedown on
					the table. They form the Tavern deck.
				</li>
			</ul>
			<p class="text-slate-400">
				The Jester cards are not used. Shuffle the remaining cards and set them facedown on the
				table. They form the Tavern deck.
			</p>
			<p class="text-slate-400">Deal 7 cards to each player from the Tavern deck.</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">HOW TO PLAY</h1>
			<p class="text-slate-400">
				On your turn, you play a card (or multiple cards) and deal damage to your opponent according
				to the value of the cards you have played. In addition, every suit has a special power that
				is the same or similar as in standard Regicide.
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♥ Hearts heal the deck</h2>
			<p class="text-slate-400">When you play a Heart, refill the Tavern deck.</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♦ Diamonds draw cards</h2>
			<p class="text-slate-400">
				When you play a Diamond, draw (hire) new cards from the Tavern deck.
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♣ Clubs double the attack</h2>
			<p class="text-slate-400">When you play a Club, your attack value is doubled.</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♠ Spades shield you</h2>
			<p class="text-slate-400">
				When you play a Spade, it is added to the shield against your opponent's attacks.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">
				STEPS TO PERFORM ON YOUR TURN
			</h1>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">1. Play a card (or a combo)</h2>
			<p class="text-slate-400">
				On your turn, you must play one or multiple cards from your hand. Multiple cards (a combo)
				can be played if the cards have the same number, but their total value must not exceed 10.
			</p>
			<p class="text-slate-400">Played value is the total value of the cards you have played.</p>
			<p class="text-slate-400">
				If you play a pair of threes, the played value is 6. Both suit powers are applied.
			</p>
			<p class="text-slate-400">
				If you play four twos, the played value is 8. All suit powers are applied.
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">2. Refill the Discard deck ♥</h2>
			<p class="text-slate-400">
				If you played a Heart, shuffle the Discard deck and add a number of cards equal to the
				played value to the bottom of the Tavern deck (same as you would do in standard Regicide).
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">
				3. Draw cards from the Tavern deck ♦
			</h2>
			<p class="text-slate-400">
				If you played a Diamond, draw a number of cards up to the played value from the Tavern deck.
				Stop drawing when you have 7 cards in your hand, or when the Tavern deck is empty.
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">
				4. Deal damage to your opponent
			</h2>
			<p class="text-slate-400">
				Your attack value is normally equal to the played value. If you played a Club, your attack
				value is double the played value. Your opponent’s shield value is the total value of all
				cards in their play area. (These will be only Spades or combos that include a Spade.)
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">5. Cleanup</h2>
			<p class="text-slate-400">
				At the end of your turn, discard the cards you have played, unless you have played a Spade.
				A played Spade (or a combo that includes a Spade) is added to your shield and stays in your
				play area until the shield is destroyed by your opponent.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">PLAYING COMBOS</h1>
			<p class="text-slate-400">
				Aces, or animal companions, are the same as in standard Regicide. Ace has a value of 1. It
				can be played alone, or it can be played together with any one card to form a combo. This
				type of combo can be played even if the played value exceeds 10.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">END OF THE GAME</h1>
			<p class="text-slate-400">
				The game ends when a player does not have enough cards to satisfy the damage, or cannot play
				a card on his turn. The other player is the winner
			</p>
		</div>
	</div>
</div>
