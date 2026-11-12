# Getting started: share a file with someone

This page is for you who downloaded DAP-Share and want to try it. You need no background and
you type no commands. It takes about ten minutes.

**What happens:** you and another person each start an *agent* on your own computer. One shares
a file, the other fetches it. The file is encrypted all the way, and it lands in an *airlock* at
the receiver: nothing enters the computer until the receiver presses the button.

## You need

- A **Mac** with **Python 3.6 or later**. If Python is missing you will see it in step 2 below;
  install it from python.org and start again.
- **`DAP-Share.app`**, which you get by unpacking `DAP-Share.zip` from the download page.
- **A code** that the two of you agree on, at least six characters. For example `tuesday-2026`.

## Start

1. **Move the app to Applications.** Drag `DAP-Share.app` to *Applications* in Finder's sidebar.

2. **Open it the first time.** In *Applications*, **right-click** `DAP-Share` and choose **Open**,
   and then **Open** once more in the box that appears.

   The Mac asks the first time because the app was downloaded and its developer is not registered
   with Apple. It says nothing about what the app does. After the first time a double-click is
   enough.

   **On macOS 15 or later** the right-click does not offer this. Double-click the app once and
   close the box. Then open *System Settings* → *Privacy & Security*, scroll down to the line that
   says DAP-Share was blocked, and press **Open Anyway**.

   **If the Mac still refuses**, there is a way that always works. Open the program *Terminal*
   (press ⌘ and space, type `Terminal`, press return), paste this line and press return:

   ```
   xattr -dr com.apple.quarantine /Applications/DAP-Share.app
   ```

   Nothing is printed when it works. It removes the mark the Mac puts on downloaded files, for this
   app only. Then double-click the app as usual. If you left the app in *Downloads*, write
   `~/Downloads/DAP-Share.app` at the end of the line instead.

3. **Type your name** in the box that asks for it, and press OK. The person you share with sees it.

4. **Your browser opens the screen**, and Finder opens your share folder. At the top of the
   screen is your name and *Your address*, a line that starts with `dap:crypto:`. To the right it
   should say `relay: connected`.

The app has no window of its own: the screen in the browser is its window. Opening the app again
opens the screen again. To stop it, press **Stop DAP-Share** at the top of the screen.

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

## If it does not work

| It says, or what happens | What it means | Do this |
|---|---|---|
| "cannot be opened because it is from an unidentified developer", or "Apple could not verify" | The Mac's check of downloaded files, the first time | Right-click the file and choose *Open*. On macOS 15 or later: *System Settings* → *Privacy & Security* → *Open Anyway* |
| The Mac still refuses, or there is no *Open Anyway* | The mark on downloaded files is still on the app | Step 2 under *Start*, **If the Mac still refuses**: one line in Terminal |
| "DAP-Share needs Python 3" | The computer has no Python | Install it from python.org and open the app again |
| `relay: off` or `relay: not connected` | Your computer does not reach the relay | Check your internet; close the window and start again |
| `peer not registered` | The other agent is not connected right now | Ask them to open the app and check that the screen shows `relay: connected` |
| `timed out` | The other computer does not answer | The same; often they switched network or the computer went to sleep |
| The meeting worked but no file came | The code did not match | Check that you typed exactly the same code |
| The file under *Share* cannot be ticked | It is a program or an unknown format | Programs are never shared. Try a picture, a PDF or a text file |
| Nothing seems to happen when you open the app | It is already running | Look for the screen in your browser; opening the app again opens it |

## What you just relied on

- The file was encrypted between your two computers. The relay only saw that two agents talked.
- Your agent checked that the one it reached really was the `dap:crypto:…` you entered.
- The file was not run. It was placed in your folder as an ordinary file, and only when you
  pressed the button.
- The screen can only be reached from your own computer.

The relay never sees what is shared.

## In a terminal instead

The download page also has `dap-share.pyz`, the same program as one file. It runs with commands on
any computer with Python 3.6:

```
python3 dap-share.pyz                # the same as opening the app: the screen opens
python3 dap-share.pyz serve --name "Your name" --relay HOST:PORT --share hello.txt --audience ANYONE_WITH_CODE --code tuesday-2026
python3 dap-share.pyz meet  --name "Your name" --relay HOST:PORT --peer dap:crypto:… --code tuesday-2026 --release-all
```
