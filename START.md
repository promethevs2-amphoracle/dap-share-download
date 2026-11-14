# Getting started: share a file with someone

This page is for you who downloaded DAP-Share and want to try it. You need no background and
you type no commands. It takes about ten minutes.

**What happens:** you and another person each start an *agent* on your own computer. One shares
a file, the other fetches it. The file is encrypted all the way, and it lands in an *airlock* at
the receiver: nothing enters the computer until the receiver presses the button.

## You need

- A **Mac** with **Python 3.6 or later**. If Python is missing you will see it in step 3 below;
  install it from python.org and start again.
- **`DAP-Share.zip`** from the download page, https://dapshare.app. Step 1 below.
- **A code** that the two of you agree on, at least six characters. For example `tuesday-2026`.

## Start

1. **Download and unpack.** On https://dapshare.app press **Download for Mac**. If your browser
   asks where to save the file, choose a place you will find again, for example the Desktop, and
   press **Save**. Double-click `DAP-Share.zip` there. Next to it you get `DAP-Share`, the green
   icon with the eyes.

2. **Move the app to Applications.** Drag `DAP-Share` to *Applications* in Finder's sidebar. If
   you had DAP-Share before, the Mac asks whether to replace the older one: press **Replace**.

3. **Open it from the inside.** The Mac does not open a downloaded app by a double-click when its
   developer is not registered with Apple. That says nothing about what the app does. Start it
   like this instead; no typing is needed:

   1. In *Applications*, **right-click** `DAP-Share` and choose **Show Package Contents**. A
      window opens with one folder, `Contents`.
   2. Open `Contents`, and then the folder `MacOS` inside it. It holds one file, `DAP-Share`.
   3. **Right-click** that file, choose **Open With**, and then **Terminal**. If Terminal is not
      in the list, choose *Other…*, open the folder *Utilities* and pick *Terminal* there.
   4. The Mac says that "DAP-Share" is a Unix application downloaded from the Internet and asks
      whether you are sure you want to open it. Press **Open**. A Terminal window shows a few
      lines; it can be closed.

   Open the app the same way after you have downloaded a new version.

   *Other ways, if you prefer them.* On some Macs it is enough to right-click the app, choose
   **Open**, and **Open** once more in the box. On macOS 15 or later: double-click the app, close
   the box, then *System Settings* → *Privacy & Security* → **Open Anyway**. Whoever prefers to
   type can open *Terminal* and run `xattr -dr com.apple.quarantine /Applications/DAP-Share.app`,
   which removes the Mac's mark on this downloaded app; after that a double-click is enough.

4. **Type your name** in the box that asks for it, and press OK. The person you share with sees it.
   The box comes only the very first time.

5. **Your browser opens the screen**, and Finder opens your share folder. At the top of the
   screen is your name and *Your address*, a line that starts with `dap:crypto:`. To the right it
   should say **online** (or *connecting …* for a moment).

The app has no window of its own: the screen in the browser is its window. Opening the app again
opens the screen again. To stop it: **Settings**, the card *This computer*, **Stop DAP-Share**.

Your files are kept in the folder **`DAP-Share`** in your home folder, with a dark icon and a green
tab, not inside the app. Dragging that folder to Finder's sidebar keeps it one click away.

The screen follows your browser's language, English or Swedish. The link in the top right corner
switches.

## If you are SHARING a file

1. Put the file in the folder **`DAP-Share/Share`** in your home folder. Finder opened it for you
   the first time, and the button **Open the folder** on the screen opens it at any time.

2. On the screen, in the box **Share**: the file shows up within a few seconds. Tick it.

3. Under *Who gets them* choose **anyone with the code**, and type the code you agreed on in the
   field below.

4. Press **Share the ticked ones**. The file is now listed under *Shared right now*.

5. Press **Copy** next to your address at the top, and send the address to the other person.

## If you are FETCHING a file

1. On the screen, in the box **Meet someone**, under *Over the internet*: paste the other
   person's address in the field `dap:crypto:…`. The relay field next to it is already filled in.

2. Type the code in the field *code*.

3. Press **Meet**. Under *Meetings* you now see the file, with a colour. Green means the checks
   passed.

4. Press **Let the green ones in**. That is the button: only now does the file land on your
   computer, in the folder **`DAP-Share/Received`** in your home folder.

   What is red is not let in by that button.

## Find people and become friends

1. The first time, the screen asks **Let others find you?** Answer **Yes, make me visible** and
   people with the app can find your name. Only friends you accept ever see your files.

2. Press **Friends** on the first screen. Under **Find people**, type a name and press **Search**.

3. Press **Add friend** next to the person. They see your request at the top of their screen and
   press **Accept**. You are friends when both have said yes; nothing more to do on your side. If
   they are away, the request is sent when they are back.

4. To stop someone reaching you, press **Block** next to their name or request. They get nothing
   from you and their requests are not shown; they are not told. **Unblock** is under your friends.
   What the directory shows and keeps: https://dapshare.app/privacy.html

## With friends: no code, no button

When you and another person are friends in the app, neither of you has to share file by file.

1. The first time, the screen asks **Should your friends see your share folder?** Answer
   **Yes, show it to my friends**. From then on your friends can fetch whatever is in your
   `DAP-Share` share folder. Put a file there and they can fetch it; take it out and it is gone.
   Nobody who is not your friend sees the folder. You change your answer under **Friends**, at
   **Friends see your share folder**.

2. To look in a friend's folder: press **Friends** on the first screen, find the friend, press
   **See folder**. You see the file names. Nothing has been fetched yet.

3. Press **Fetch** on the ones you want, or **Fetch all**. They land in `DAP-Share/Received`.
   Under *Picked for you* are files your friend, or your friend's AI agent, chose for you.

## Your phone, from anywhere

Your own phone can show the same screen as your computer, wherever you are: over the internet,
encrypted all the way. The phone may do what you do on the screen, except change the settings.
At most three phones.

The computer has to be on and awake, with DAP-Share running. A phone cannot wake a computer
that sleeps; see *So that the phone finds the computer awake* below.

**Connect a phone**

1. **On the computer:** press **Settings** on the screen. Under **Your phone, from anywhere**,
   press **Connect a phone**. A square code appears. It works once, for five minutes.

2. **On the phone:** open `https://dapshare.app/remote` in Safari. Tap the Share button (the
   square with the arrow) and choose **Add to Home Screen**. A DAP-Share icon lands on the Home
   Screen. (On Android: the browser's menu, then *Add to Home screen*.)

3. **Open that icon**, not the page in Safari: the icon has a memory of its own, and that is
   where the phone remembers your computer. Tap **Scan the code on my computer** and point the
   camera at the code on the computer's screen. If the phone asks whether the page may use the
   camera, allow it.

4. **Compare the four digits.** The phone shows four digits. The computer's screen now asks
   *A phone wants to be your remote* and shows four digits too. If they are the same, press
   **Yes, allow** on the computer. If they differ, or the computer asks when you have not just
   scanned the code yourself, press **No**.

5. The phone now shows your screen. From now on, opening the icon is enough.

**Files between the phone and the computer:** on the phone's first screen, press
**Files on the computer**. **Save to phone** fetches a file from the computer. **Choose files**
sends one from the phone; it lands in your share folder on the computer. At most 200 MB per file.

**Remove a phone:** on the computer, press **Settings**. Under **Your phone, from anywhere**,
press **Remove** next to the phone, and then **Yes, remove**. It is out at once, and cannot get in
again until you connect it anew. Do this if a phone is lost. *Forget this computer* on the phone
only makes the phone forget: the computer keeps the phone in its list until you remove it there.

**So that the phone finds the computer awake:** on the computer, press **Settings**. Under
**This computer** there are two switches:

1. **Keep this Mac awake while DAP-Share runs**: press **Turn on**. The Mac then does not fall
   asleep by itself. A laptop still sleeps when its lid is closed, so leave it on its charger with
   the lid open. The display may turn off; that does not matter.

2. **Start DAP-Share when I log in**: press **Turn on**. From the next time you log in to the Mac,
   DAP-Share starts by itself, quietly, without opening the screen. If you move the app to another
   folder, turn this off and on again. It also works for an app you opened from the inside
   (step 3): DAP-Share then starts its own launcher at login, the way you opened it, so the Mac
   does not stop it. Not yet tried on a real Mac: if it does not start, tell us.

## If it does not work

| It says, or what happens | What it means | Do this |
|---|---|---|
| "cannot be opened because it is from an unidentified developer", or "Apple could not verify" | The Mac's check of downloaded files, the first time | Open the app from the inside, step 3 under *Start*: right-click the file inside the app, *Open With* → *Terminal*. Other ways are listed there |
| "DAP-Share needs Python 3" | The computer has no Python | Install it from python.org and open the app again |
| `relay: off` or `relay: not connected` | Your computer does not reach the relay | Check your internet; close the window and start again |
| `peer not registered` | The other agent is not connected right now | Ask them to open the app and check that the screen says **online** |
| `timed out` | The other computer does not answer | The same; often they switched network or the computer went to sleep |
| The meeting worked but no file came | The code did not match | Check that you typed exactly the same code |
| The file under *Share* cannot be ticked | It is a program or an unknown format | Programs are never shared. Try a picture, a PDF or a text file |
| Nothing seems to happen when you open the app | It is already running | Look for the screen in your browser; opening the app again opens it |
| On the phone: "The computer does not answer" | The computer is asleep or off, or DAP-Share is not running on it | Wake the computer and open DAP-Share there; the phone connects by itself (after a sleep the computer finds the relay again within about a minute and a half). To keep it from happening: *Keep this Mac awake*, under *Your phone, from anywhere* above |
| On the phone: "No longer a remote" | The phone was removed on the computer | Press **Connect a phone** on the computer and scan the new code |
| On the phone: "The code no longer works" | The code works once, for five minutes | Press **Connect a phone** on the computer for a new one |

## What you just relied on

- The file was encrypted between your two computers. The relay only saw that two agents talked.
- Your agent checked that the one it reached really was the `dap:crypto:…` you entered.
- The file was not run. It was placed in your folder as an ordinary file, and only when you
  pressed the button.
- The screen can only be reached from your own computer, and from a phone you have said yes to
  on the computer itself, after comparing the four digits.

The relay never sees what is shared.

## In a terminal instead

The download page also has `dap-share.pyz`, the same program as one file. It runs with commands on
any computer with Python 3.6:

```
python3 dap-share.pyz                # the same as opening the app: the screen opens
python3 dap-share.pyz serve --name "Your name" --relay HOST:PORT --share hello.txt --audience ANYONE_WITH_CODE --code tuesday-2026
python3 dap-share.pyz meet  --name "Your name" --relay HOST:PORT --peer dap:crypto:… --code tuesday-2026 --release-all
```
