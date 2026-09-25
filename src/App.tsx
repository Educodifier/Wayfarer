/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameCanvas } from './game/GameCanvas';

export default function App() {
  return (
    <main id="app-root" className="w-screen h-screen overflow-hidden bg-[#071315]">
      <GameCanvas />
    </main>
  );
}

