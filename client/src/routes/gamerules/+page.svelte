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
				PLAY
			</button>
		</div>
		<div class="col-span-10 p-8 bg-white bg-opacity-5 rounded-lg">
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">AIM OF THE GAME</h1>
			<p class="text-slate-400">
				The aim of the game is to defeat the other player (duh), by either destroying their shield,
				or making an attack they cannot counter.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">SETUP</h1>
			<p class="text-slate-400">
				Each player draws 7 cards to start the game with (which is the maximum number of cards they
				can have in their hand), from their shuffled standard deck of 52 playing cards. The
				remaining cards are placed face down. They form the draw pile. Each player starts with 300
				'health points' in their 'Shield'.
			</p>
			<p class="text-red-400">include image here.</p>
			<p class="text-slate-400">Note that decks are shuffled in a specific way:</p>
			<ol class="text-slate-400">
				<li>1. Diamond suit cards are shuffled separately.</li>
				<li>2. The rest of the cards are shuffled separately.</li>
				<li>
					3. The deck is formed back together by placing 1 Diamond suit card, then 3 non Diamond
					suit card, repeatedly, untill we form the deck.
				</li>
			</ol>
			<p class="text-red-400">include example of shuffled deck here.</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">HOW TO PLAY</h1>
			<p class="text-slate-400">
				The game is played in a series of turns consisting of a defense phase and an attack phase,
				the game starts with one of the players in the attack phase.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">ATTACK PHASE</h1>
			<p class="text-slate-400">
				In your attack phase, you attack your opponent with a card (or multiple cards) and deal
				damage to your opponent's shield according to the offensive power of the cards you have
				played. In addition, every suit has a special effect that is the same or similar as in
				standard Regicide. The effects are applied in this order:
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♠ Spades</h2>
			<p class="text-slate-400">
				Attacking with Spades discards the top 3 cards of the opponent's draw pile to their discard
				pile.
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♥ Hearts</h2>
			<p class="text-slate-400">
				Attacking with Hearts refills the draw pile from the discard pile. The amount of cards
				refilled is equal to the total offensive power of the cards you attacked with.
			</p>
			<p class="text-slate-500">
				Note that the the cards refilled are picked randomly from the discard pile.
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♦ Diamonds</h2>
			<p class="text-slate-400">
				Attacking with Diamonds refills your hand from the draw pile. The amount of cards refilled
				is equal to the total offensive power of the cards you attacked with.
			</p>
			<p class="text-slate-500">
				Note that you can only hold a maximum of 7 cards in your hand. This effect does not bypass
				that and only restores cards untill your hand is full.
			</p>
			<h2 class="text-xl text-slate-100 font-black drop-shadow-md">♣ Clubs</h2>
			<p class="text-slate-400">
				Attacking with Clubs doubles the total offensive power of the cards you attacked with.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">DEFENSE PHASE</h1>
			<p class="text-slate-400">
				In your defense phase, you must discard cards from your hand to the discard pile. The cards
				discarded need to have a total defensive power that is greater or equal to the total
				offensive power of the cards the opponent attacked you with.
			</p>
			<p class="text-slate-400">
				If the defensive power of the discarded cards is exactly equal to the offensive power of the
				attack, you draw 1 card from the draw pile.
			</p>
			<p class="text-slate-500">
				Note that you can discard as many cards as you would like, be mindfull however that
				discarding all cards from your hand makes you lose the game.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">CARDS POWER</h1>
			<p class="text-slate-400">
				Aces and Face Cards (A, J, Q & K) have an offensive power of 1 and a defensive power of 10.
			</p>
			<p class="text-slate-400">
				Numbered Cards (2...9) have their number as both their offensive power and defensive power.
			</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">PLAYING COMBOS</h1>
			<p class="text-slate-400">
				You can attack with multiple cards. However, the cards you attack with must follow these
				rules:
			</p>
			<ul class="text-slate-400">
				<li>- No more than one numbered card (2...9).</li>
				<li>- Only one card of each Suit.</li>
			</ul>
			<p class="text-red-400">include examples of allowed combos.</p>
			<h1 class="text-2xl text-slate-100 font-black drop-shadow-md">END OF THE GAME</h1>
			<p class="text-slate-400">The game ends when a player either:</p>
			<ul class="text-slate-400">
				<li>- Loses their shield.</li>
				<li>
					- Cannot defend against an attack (a successful defense is discarding enough cards to
					cover the opponent's attack offensive power AND still have cards in your hand to attack
					with.)
				</li>
			</ul>
			<p class="text-slate-400">In both these cases, the opponent wins (duh).</p>
		</div>
	</div>
</div>
