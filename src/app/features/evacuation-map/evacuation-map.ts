import { Component, Input, signal } from '@angular/core';

@Component({
  selector: 'app-evacuation-map',
  standalone: true,
  templateUrl: 'evacuation-map.html',
  styleUrls: ['evacuation-map.scss'],

})
export class EvacuationMap {
  safeExit = signal<string | null>(null);

  exitCoords: Record<string, { x: number; y: number }> = {
    main: { x: 500, y: 640 },
    east: { x: 940, y: 350 },
    west: { x: 40, y: 350 },
  };

  selectExit(exit: string) {
    this.safeExit.set(exit);
  }
}
