# LDR Games 💕

A mobile-friendly webapp for long-distance couples to play two-player games together in real-time. No login required - just share a unique session link!

## Features

- 🚢 **Battleship** - Classic naval warfare game with enhanced features:
  - 🎲 **Random Ship Placement** - Ships are automatically positioned for quick gameplay
  - 🎨 **Pastel Color Theme** - Soft, gentle colors for a pleasant gaming experience
  - 💥 **Explosion Animations** - Visual effects when ships are destroyed
  - 📊 **Ship Tracking** - Real-time tracking of destroyed enemy ships
- 📱 **Mobile-first design** - Optimized for phones and tablets
- ⚡ **Real-time gameplay** - Powered by Supabase Realtime
- 🔗 **Easy sharing** - Copy and share session links
- 💕 **Couple-friendly** - Beautiful, minimalist design

## Tech Stack

- **Frontend**: Next.js 15 with App Router + TailwindCSS
- **Backend**: Supabase (Postgres + Realtime)
- **Hosting**: Vercel (frontend) + Supabase (data)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ldr-games
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
4. Enable Realtime for the `game_sessions` table in the Database > Replication section

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the same environment variables in Vercel's dashboard
4. Deploy!

## How to Play

1. **Create a Game**: Click "Create Game" on the home page
2. **Share the Link**: Copy the session link and send it to your partner
3. **Join the Game**: Your partner clicks the link to join
4. **Play Battleship**: Take turns firing shots at each other's ships
5. **Win**: First to sink all opponent's ships wins!

## Game Rules

### Battleship
- Each player has a 10×10 grid
- Ships are randomly placed (5 ships: Carrier, Battleship, Cruiser, Submarine, Destroyer)
- Players take turns firing shots
- Hit = red square with explosion emoji
- Miss = gray square with water drop emoji
- Game ends when one player sinks all opponent's ships

## Database Schema

The app uses a single `game_sessions` table with the following structure:

- `id`: Unique session identifier
- `game_type`: Type of game (currently 'battleship')
- `status`: 'waiting', 'active', or 'finished'
- `current_player`: Which player's turn it is (1 or 2)
- `player1_board` / `player2_board`: JSON stringified game boards
- `player1_ships` / `player2_ships`: JSON stringified ship positions
- `moves`: JSON array of all moves made
- `winner`: Player number who won (1 or 2)

## Contributing

This is a fun project for couples! Feel free to:
- Add new games (Tic-tac-toe, Connect 4, etc.)
- Improve the UI/UX
- Add sound effects
- Enhance mobile experience

## License

MIT License - Feel free to use this for your own couple's game night! 💕