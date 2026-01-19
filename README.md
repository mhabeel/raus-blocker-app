## Aufgabe 2 – Offene Fragen & Annahmen

- Während der Umsetzung der Aufgabe sind einige Punkte aufgekommen, die im ursprünglichen Task nicht vollständig definiert waren.

- Offene Fragen

- Wie erkennt der Landpartner, ob ein Zeitraum bereits gebucht ist oder nicht?

- Welchen Zugang hat der Landpartner (direkter Apaleo-Zugang oder nur über diese Anwendung)?

- Welche Rolle hat der Landpartner und welche Berechtigungen sind erlaubt?

- Welche Felder einer Maintenance dürfen bearbeitet werden (z. B. Zeitraum, Typ, Grund)?

- Dürfen Blocker jederzeit gelöscht werden oder nur vor Beginn des Zeitraums?

## Getroffene Annahmen & Umsetzung

- Um ein funktionierendes MVP zu bauen, wurden folgende Annahmen getroffen und direkt in der Anwendung umgesetzt:

- Urlaubs-Blocker werden als OutOfInventory Maintenance angelegt

- Check-in ist 15:00, Check-out 11:00

- Landpartner können:

   - Blocker erstellen

   - den Grund (Reason / Description) bearbeiten

   - Blocker löschen, falls sich Pläne ändern




Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
