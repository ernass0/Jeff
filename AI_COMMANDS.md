make all these commands, function work
make it so they run on integrated discord / commands
make owner only commands prexix !
make help menus:
1. with all commands and descriptions (expliding owner only commands)
2. when !help shows all owner only commands with description

 Main commands:
* roster: Team roster
 * ratings: Player ratings
 * load: Load the league file.
 * stats: Player stats
 * player: Player info
 * set-channel news: News
 * set-channel offers: Offers
 * set-channel releases: Releases
 * set-channel renouncing: Renouncing Holds
 * set-channel signings: Signings
 * set-channel standings: Standings
 * set-channel trades: Confirmed Trades
 * top-prospects: Top Draft Prospects
 * user: Provides information about the user.
 * roster-prog: Team progressions
 * awards: Player awards
 * sign-free-agents: Sign all free agents to their best respective offers
 * check-offers: Check on your submitted offers
 * extend-cap-holds: Extend RFA contract length.
 * picks: Team draft picks
 * generate-skill-points: Generate skill points
 * assign: Assign player
 * progs: Player progressions
 * top-fas: Top Free Agents
 * boost: Boost a player's rating.
 * boost-gl: Increase specific player ratings using GL points.
 * cap-holds: A team's cap holds
 * clear-cap-holds: Clear all cap holds
 * clear-offers: Delete all free agency offers
 * compare: Compare player ratings
 * compare-stats: Compare player statistics
 * deaths: Player deaths
 * delete-offer: Delete an offer to a Free Agent
 * draft-order: League draft order
 * extend-rfas: Extend RFA contracts.
 * finances: Team finances
 * flag: Watch-list players on expiring rookie contracts.
 * generate-bgmdl-values: Generate BGMDL values.
 * generate-cap-holds: Generate cap holds
 * offer: Send an offer to a Free Agent
 * opicks: Team's original draft picks
 * prog-compare: Compare player progressions
 * reload: Reloads a command.
 * remove-gm: Remove a GM or a Front Office member.
 * renounce: Renounce player cap holds
 * renounce-all: Renounce all player cap holds
 * rfa-extensions: List all of the available RFA extensions.
 * rookie-extensions: List all of the available rookie extensions.
 * score-calc: Score calculation for a player
 * score-calc-all: Score calculations for a player
 * server: Provides information about the server.
 * set-fa blind-fa: Blind Free Agency.
 * set-fa disable-holds: Disable Cap Holds.
 * set-fa enable-holds: Enable Cap Holds.
 * set-fa first-time-setup: Set up Free Agency for the first time.
 * set-fa open-fa - Open Free Agency.
 * set-gm - Assign a GM role to user.

Ideas:
0. Add a command similar to setgm but for assistant gms

1. Make some commands that only the owner can use them

2. Make Github integration:
   2.1 ​Loading the League (-load): The bot is configured with the repository's information (owner, repo name, file path, and a secure access token). It uses the GitHub API to read the contents of the league file from a specific branch (e.g., main). This ensures it always starts with the single source of truth.
     2.2 Updating and Exporting: This is the core difference. When an update occurs (e.g., a new player signing), the bot immediately performs the following actions: 
• ​It retrieves the latest version of the file from the repository via the GitHub API to prevent conflicts.
• ​It applies the necessary changes to the file's content internally.
• ​It then uses the GitHub API to directly commit the updated file back to the repository. This commit includes a descriptive message, such as "Bot: Updated roster for new signing of [Player Name]" or "Bot: Processed trade between Team A and Team B."
• ​The bot's commit is instantly visible on GitHub, and the raw file link now points to this new, updated version.
     2.3 Exporting the Link (-export): This step remains the same. When a user requests the link, the bot provides the same raw GitHub URL. The key difference is that this link is now guaranteed to be up-to-date at all times, as the bot is the one responsible for keeping it that way.

3. Trade system: 
     3.1 The Proposal: A GM initiates a trade using a specific command, like !propose trade @GM_B followed by the assets being exchanged (e.g., !propose trade @GM_B send Player A, 1st round pick 2026 receive Player B, 2nd round pick 2027).
• ​3.1.1 Bot Validation: The bot's first job is to validate the proposal. It checks to make sure: 
• ​The players and picks listed actually exist and are on the correct teams.
• ​The GM who sent the proposal has the correct assets.
• ​The trade adheres to any league rules (e.g., no trading draft picks from a certain year).
      3.2 Sending the Proposal: Once the trade is validated, the bot creates and sends a dedicated message in a designated channel. This message clearly outlines all the details of the trade and tags both GMs involved.
• ​3.2.1 Accepting/Declining with Reactions: The bot automatically adds two reaction emojis to the message, for example, a green checkmark (✅) for "accept" and a red "X" (❌) for "decline."
• ​3.2.2 Monitoring and Finalizing: The bot then monitors the reactions on that specific message. 
• ​When the bot detects that both GMs have reacted with the green checkmark, it proceeds to execute the trade.
• ​If either GM reacts with the red "X," the trade is automatically cancelled.
• ​If no one reacts within a set amount of time (e.g., 24 hours), the trade can be set to automatically expire.
      3.3 Executing the Trade: When the trade is finalized, the bot performs the core task: it updates the league's official records. This is where your league's data—rosters, contracts, and picks—is automatically changed to reflect the new deal.
     3.4 Authentication: The bot must be able to verify that the users reacting are the GMs of their respective teams. This is crucial to prevent unauthorized users from accepting or declining a trade. The bot would likely check their user ID against a list of pre-defined GM IDs.
      3.5 State Management: The bot needs to remember that a trade proposal is currently open. It would store the details of the pending trade (the message ID, the GMs involved, the assets) so it knows exactly what to do when it detects a reaction.

4. Free agency:
    4.1. Managing Free Agent Status
​The bot would need a robust database to track the status of every player. This is a critical first step. Each player's record would include their name, current team (if any), and their free agent status. The bot would need to handle the nuances of each type:
• ​UFA: Can sign with any team.
• ​RFA: Can receive offers, but their original team holds the right to match any offer. The bot must track the qualifying offer amount.
• ​Player/Team Option: The bot would have to handle a specific "decision date" for these players, where their option is either exercised or declined.
• ​Buyout/Waiver FA: These players would have specific rules and timelines the bot must enforce (e.g., waivers period).
​     4.2. The Offer Phase
• ​4.2.1 Making an Offer: GMs would use a command like !offer Player Name, [Salary], [Years]. The bot's first action would be to run a live check to see if the offering team has the necessary cap space and if the offer is within NBA salary rules (e.g., minimum salary, contract length limits). If not, the offer is rejected immediately.
• The bot can be enhanced to allow GMs to include contract options (Player Option, Team Option, ETO) in their free agency offers using a specific command.
• When an offer is made, the bot's rules engine immediately validates if the option is allowed on that contract. If valid, the bot stores this detail with the offer. Later, it automatically processes the option decision on the correct date, either keeping the player under contract or making them a free agent.
• ​4.2.2 Tracking and Displaying Offers: The bot would store every valid offer in its database. To make this visible to GMs and the free agent, you could implement one or both of the methods you suggested: 
• ​4.2.3 Offer Channel: The bot posts a message in a designated channel for each player, listing all current offers. This could be a single, pinned message the bot updates frequently.
• ​4.2.4 Offer Command: A command like !checkoffers Player Name would have the bot list all offers for that specific player, pulling the data from its database.
​     4.3. The Signing Logic
​This is the most complex part of the system, where the bot's "brain" makes a decision. The bot would need a scheduled task that runs at a specific time each day to finalize any signings. The logic would be:
• ​4.3.1 Find the "Top Offer": For each free agent, the bot would look at all offers in its database. The "top offer" is not simply the highest salary, but the highest valid offer based on the player's free agent type and the rules.
• ​4.3.2 Enforcing Cap Space and Rules: Before finalizing the signing, the bot would run a final check on the winning team. This includes verifying: 
• ​The team still has the necessary cap space.
• ​The offer is a valid contract under the NBA's Collective Bargaining Agreement (CBA) and its complex rules (e.g., salary exceptions, luxury tax apron rules).
• ​If the player is an RFA, the bot would first give the original team a chance to "match" the offer within a specified time period
      4.4. A Database: A relational database (like PostgreSQL or MySQL) or a NoSQL database (like MongoDB) is essential to manage all the interrelated data: Players, Teams, Contracts, Offers, Draft Picks, and CBA Rules.
      4.5. A "Rules Engine": This is the core of the bot's intelligence. It would be a module dedicated to performing complex calculations and checks, such as: 
• ​Calculating and tracking each team's exact salary cap and luxury tax space.
• ​Recognizing and applying various salary cap exceptions (e.g., Mid-Level, Bi-Annual, Room Exception).
• ​Managing the specifics of different free agent contract types.


5. Draft lottery system:
• ​5.1 Data Input: The bot would first need the final standings of the non-playoff teams. For each team, it would need to know its record to determine its lottery position and corresponding odds.
• ​5.2 Probability-Based Drawing: 
• ​5.2.1 The "Ping Pong Balls": The bot's core logic would be to replicate the 14 numbered ping pong balls used by the NBA. With these, there are 1,001 possible four-ball combinations, with one combination being unassigned.
• ​5.2.2 Assigning Combinations: Based on the team's record, the bot would programmatically assign a number of these combinations to each team. For example, the teams with the three worst records would each be assigned 140 combinations, giving them a 14% chance of winning the top pick. The odds would decrease for each subsequent team.
• ​5.2.3 Drawing the Winners: The bot would then perform a series of random drawings to determine the first four picks. For each drawing: 
• ​The bot selects a random four-number combination from the 1,000 assigned combinations.
• ​It determines which team holds that combination.
• ​This team is awarded the pick. The bot then removes all of that team's combinations from the pool for subsequent drawings to ensure they can't win another top-four pick.
• ​This process is repeated to determine picks 2, 3, and 4.
• ​5.2.4 Finalizing the Order: 
• ​After the first four picks are determined by the lottery, the bot automatically assigns the remaining lottery picks (5 through 14) in reverse order of the teams' regular-season records.
• ​Any ties in record would be broken by a pre-determined random drawing.
​5.3 The Reveal
​The bot would be programmed to make the lottery reveal a dramatic event. Instead of simply posting a final list, it could be a staged, interactive process:
• ​5.3.1 Pre-Lottery Announcement: The bot announces that the lottery is about to begin, listing all the teams in their initial position (e.g., Team A in the #1 slot with a 14% chance).
• ​5.3.2 Live Countdown: The bot can create a countdown, similar to a real broadcast.
• ​5.3.3 The Big Reveal: The bot would announce the results in reverse order, from the 14th pick up to the 1st pick. As each pick is announced, the bot would confirm which team received it, making the event suspenseful.
• ​5.3.4 Final Summary: Once the lottery is complete, the bot would post a final message with the complete, official draft order for the entire first round.

6. Draft board:
This feature allows each GM to create and prioritize their own personal list of desired players before the draft begins. The bot will use this list as a fallback for automatic picks.
• ​6.1 Setting Up the Board: GMs would use simple commands to manage their list. 
• ​!add Player Name would add a player to their personal board.
• ​!remove Player Name would take a player off the board.
• ​!reorder Player 1, Player 2, Player 3... would allow them to set the priority, with the first name being their top choice.
• ​The bot would store a unique, prioritized list for each GM in its database, separate from any league-wide rankings.
• ​6.2 The Auto-Draft Logic: The crucial part is when a GM's timer expires. The bot's logic would be designed with a clear hierarchy: 
• ​6.2.1 Check Personal Board: The bot first checks the GM's personal draft board.
• ​6.2.2 Find Top Available Player: It scans the GM's list from top to bottom, looking for the highest-ranked player who is still available on the main draft board.
• ​6.2.3 Make the Pick: The bot automatically makes the pick for that player, announcing it to the league and updating all relevant rosters and the draft board.
• ​6.3 Fallback: If the GM's entire personal list has been drafted, the bot would then resort to a pre-defined league-wide ranking (e.g., a consensus mock draft list) to make the next best available pick, ensuring the team is never left without a player.

7. Draft system:
​7.1. Pre-Draft Setup
• ​7.1.1 Draft Order: Before the draft, the bot would run the draft lottery you've already discussed to determine the first round order. For subsequent rounds, the bot would automatically set the order in reverse order of league standings.
• ​7.1.2 Pick Management: The bot would have a database that tracks all draft picks, including those that have been traded. This would be crucial for a dynasty league. As the draft progresses, the bot would ensure that the correct team is on the clock, even if they've traded their pick.
• ​7.1.3 Draft Board: The bot would maintain a live, public draft board, which could be a pinned message in a channel or a dedicated web page. This board would show every team's current pick, the players already drafted, and the players remaining on the board.
​7.2. The Live Draft
• ​7.2.1 On the Clock: The bot would announce when a team is "on the clock," tagging the GM. The bot would also start a timer, allowing a set amount of time (e.g., 5-10 minutes) for the pick to be made.
• ​7.2.2 Making a Pick: The GM would make their selection using a command, such as !pick [Player Name]. The bot would instantly validate the pick to ensure the player is still available and that the command is coming from the correct GM.
• ​7.2.3 Announcement and Update: Once a valid pick is made, the bot would: 
• ​Announce the pick to the entire league (e.g., "With the #1 overall pick, Team A selects Victor Wembanyama!").
• ​Update the live draft board to show the player as drafted.
• ​Mark the pick as complete in its database.
• ​Automatically put the next team on the clock and start their timer.
​7. 3. Handling Special Situations
• ​7.3.1 Auto-Draft: If a GM fails to make a pick before the timer expires, the bot would have an automatic drafting feature. It could be programmed to either pick the highest-ranked player from a pre-determined draft list or pick the highest-ranked player for a position of need.
• ​7.3.2 Trades During the Draft: The bot could even be integrated with a trade system. If a trade involving draft picks is finalized, the bot's system would instantly update the draft board and the on-the-clock team, making the draft more dynamic.
• ​7.3.3 Roster Updates: As each player is drafted, the bot would automatically add them to the drafting team's roster in its database. This ensures that when the draft is over, all team rosters are finalized and ready for the next phase (e.g., free agency or a new season).

8. Releasing players:
8.1. The Simple Release
​For a straightforward release of a player, the process is quick and efficient.
• ​8.1.1 The Command: A GM would use a simple command like !release Player Name.
• ​8.1.2 Bot Validation: The bot's first action is to verify that the player is indeed on that GM's roster and that the GM is authorized to make the move.
• ​8.1.3 Action and Announcement: Upon validation, the bot instantly removes the player from the team's roster in its database. It then sends a message to a designated league channel announcing the release, making the player available for other teams to sign as a free agent.
​8.2. The Waiver System
​To add a layer of realism, the bot can implement a waiver period. This prevents a released player from being immediately available to other teams.
• ​8.2.1 The Command: A GM would use a command like !waive Player Name.
• ​8.2.2 Waiver Timer: The bot removes the player from the roster but puts them into a "waiver" status. It then starts a timer (e.g., 48 hours). During this period, the player is unavailable to sign as a free agent.
• ​8.2.3 Claiming a Player: Other GMs can submit a waiver claim using a command like !claim Player Name. The bot tracks all claims and the claiming team's waiver priority (typically based on reverse order of standings).
• ​8.2.4 End of Waiver Period: When the timer expires, the bot's scheduled task runs: 
• ​It determines which team, if any, made a claim.
• ​If multiple claims exist, it awards the player to the team with the highest waiver priority.
• ​It then moves the player to the winning team's roster and updates the salary cap accordingly.
• ​If no team claimed the player, they become a standard free agent.
​8.3. Contractual Releases (Buyouts)
​For players on guaranteed contracts, a simple release may not be enough. The bot can handle complex contract negotiations.
• ​8.3.1 The Command: GMs would use a command like !buyout Player Name, [Buyout Amount].
• ​8.3.2 Cap Space Management: This is where the bot's rules engine is critical. It would calculate the cap penalty of the buyout (the remaining salary minus the buyout amount) and automatically apply that to the team's salary cap. The bot could even allow the GM to spread this cap hit out over multiple seasons, mimicking real-world "stretch provision" rules.
• ​8.3.3Player Status: Once the buyout is finalized, the player's status changes. They are removed from the roster and enter the waiver pool (as described above) before becoming a free agent. The bot would log all financial implications of the buyout for the team's records.

9. The In-Season Signing Process
​The bot would facilitate a seamless process, from a GM finding a player to the final signing being logged and announced.
• ​9.1 Finding Available Players: GMs need a way to see who is available to sign. The bot could have a command like !freeagents that lists all players who are not currently on a roster. This list would include players who went unsigned in the offseason as well as players recently released from other teams.
• ​9.2 Making an Offer: A GM would initiate a signing with a command, such as !sign Player Name, [Salary], [Years]. The bot would be programmed to understand the different terms of a contract.
• ​9.3 Bot Validation: This is the most critical step. Before finalizing the signing, the bot would instantly run a series of checks using its internal "Rules Engine": 
• ​9.3.1 Roster Space: Does the signing team have an open roster spot?
• ​9.3.2 Cap Space: Does the team have the necessary cap space to sign the player to the proposed contract?
• ​9.3.3 Player Status: Is the player truly a free agent? The bot would check if the player is currently under contract or on waivers.
• ​9.4 Finalizing the Signing: If all validation checks pass, the bot takes the following automated steps: 
• ​9.4.1 Roster Update: It adds the player to the GM's roster in its database.
• ​9.4.2 Cap Space Update: It deducts the new contract's salary from the team's available cap space.
• ​9.4.3 Announcement: The bot posts an announcement in a designated league channel, informing all GMs of the new signing.

10. Lineup management
​10.1. Setting the Lineup
​The bot would provide GMs with simple, intuitive commands to set their lineup for the day or week.
• ​10.1.1The Commands: A GM would use a command to designate a player as a starter or to move them to the bench. 
• ​!start [Player Name] would move a player from the bench to a starting position.
• ​!bench [Player Name] would move a player from a starting position to the bench.
• ​10.1.2Bot Validation: When a command is issued, the bot's "Rules Engine" would immediately check if the move is valid based on the league's positional requirements. For example, if a team already has the maximum number of centers in their starting lineup, the bot would reject the command and inform the GM.
​10.2. Roster and Positional Tracking
​The bot's database would be crucial for this system. It would need to track each player's position, their current status (starter/bench), and the team's available roster spots for each position.
• ​10.2.1 Viewing the Lineup: GMs could use a command like !lineup to view their current starting lineup and bench. The bot would display this information clearly, perhaps indicating each player's position and any open spots.
• ​10.2.2 Positional Flexibility: For leagues with "flex" positions (e.g., a guard/forward spot), the bot would be programmed to understand these rules and automatically fill them correctly to maximize the team's potential.
​10.3. Automatic Deadline and Status Enforcement
​To make the system truly "automatic," the bot would need a scheduled process to enforce lineup deadlines and track real-world player status.
• ​10.3.1 Lineup Lock: The bot could be programmed to automatically "lock" lineups at a specific time each day or week (e.g., 5 minutes before the first game starts). After this point, no further lineup changes would be allowed until the next game day.

11. Finance system:
​11.1. Salary Cap Management
​The bot would act as the league's accountant, constantly tracking each team's financial situation.
• ​11.1.1 Real-time Cap Space: The bot's database would store the salary of every player on a team's roster. It would constantly calculate each team's current salary total and their remaining cap space.
• ​11.1.2 Cap-Based Validation: Every time a GM attempts a transaction (signing a free agent, making a trade, etc.), the bot's "Rules Engine" would perform a real-time cap check. If the move would put the team over the cap without a valid exception, the bot would reject the move, informing the GM of the cap violation.
• ​11.1.3 Cap Holds: The bot could even track "cap holds" for unsigned players, such as draft picks or restricted free agents, which would temporarily reduce a team's available cap space.
​11.2. Contract Amortization and Luxury Tax
​For a truly advanced system, the bot would handle the nuances of multi-year contracts and league finances.
• ​11.2.1 Contract Tracking: The bot's database would store the full details of every contract, including its length, annual salary, and any options. This would allow the bot to track expiring contracts and automatically handle option decisions.
• ​11.2.2 Luxury Tax: The bot could be programmed with a luxury tax threshold. If a team's total salary exceeds this number, the bot would apply a "luxury tax" to the team. This could be a virtual currency penalty or a pick penalty, serving as a disincentive for overspending.
​11. 3. Virtual Currency and Transactions
​To facilitate more complex transactions and add another layer to the league, the bot could manage a virtual currency or a token system.
• ​11.3.1 User Commands: GMs would have commands to check their team's funds, such as !balance.
• ​11.3.2 Transaction Tracking: The bot would log all financial transactions, such as a fine for a rule violation. This provides a transparent record for all GMs.

