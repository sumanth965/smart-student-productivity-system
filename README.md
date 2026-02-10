<h1 align="center">🤝 GitHub Teamwork & Branching Guide</h1>
<h3 align="center">Complete Guide for Collaborative Development using Git & VS Code</h3>

<p align="center">
  This guide explains how to work in a team using GitHub, including repository
  connection, branching strategy, collaboration workflow, and essential commands.
</p>

<hr/>

<h2>🧠 Big Picture: How Teamwork Works in GitHub</h2>

<ul>
  <li><b>Main branch (main)</b> → Stable, production-ready code</li>
  <li><b>Feature branches</b> → Individual workspaces for team members</li>
  <li><b>Pull Requests (PR)</b> → Review and merge code safely</li>
  <li><b>Pull before Push</b> → Always sync with team updates</li>
</ul>

<p>
⚠️ In teamwork, <b>never code directly on the main branch</b>.
</p>

<hr/>

<h2>🔗 Step 1: Connect GitHub Repository to VS Code</h2>

<h3>Option A: Clone using VS Code</h3>
<ol>
  <li>Open VS Code</li>
  <li>Press <b>Ctrl + Shift + P</b></li>
  <li>Select <b>Git: Clone</b></li>
  <li>Paste repository URL</li>
  <li>Select local folder</li>
  <li>Click <b>Open</b></li>
</ol>

<h3>Option B: Clone using Terminal</h3>

<pre>
git clone https://github.com/username/repository-name.git
cd repository-name
code .
</pre>

<hr/>

<h2>🔍 Step 2: Check Repository Status</h2>

<pre>
git status
</pre>

<p>
This command shows:
</p>
<ul>
  <li>Current branch</li>
  <li>Modified files</li>
  <li>Staged / unstaged changes</li>
</ul>

<hr/>

<h2>🌿 Step 3: Understanding Branches</h2>

<p><b>Wrong Way (❌):</b></p>
<pre>
main → direct coding
</pre>

<p><b>Correct Way (✅):</b></p>
<pre>
main
├── sumanth-feature
├── tanvi-ui
└── tarun-backend
</pre>

<p>
Each team member works on their own branch.
</p>

<hr/>

<h2>🌱 Step 4: Create and Switch to a Branch</h2>

<pre>
git branch
</pre>

<pre>
git checkout -b sumanth-feature
</pre>

<p>OR</p>

<pre>
git switch -c sumanth-feature
</pre>

<hr/>

<h2>✍️ Step 5: Work on Your Branch</h2>

<ul>
  <li>Write or modify code</li>
  <li>Add new files if needed</li>
  <li>Check changes regularly</li>
</ul>

<pre>
git status
</pre>

<hr/>

<h2>➕ Step 6: Stage and Commit Changes</h2>

<h3>Stage files</h3>
<pre>
git add .
</pre>

<h3>Commit with message</h3>
<pre>
git commit -m "Added login page UI"
</pre>

<p>
✔ Write meaningful commit messages describing the change.
</p>

<hr/>

<h2>⬆️ Step 7: Push Branch to GitHub</h2>

<p>First-time push:</p>
<pre>
git push -u origin sumanth-feature
</pre>

<p>Next pushes:</p>
<pre>
git push
</pre>

<hr/>

<h2>🔀 Step 8: Create a Pull Request (PR)</h2>

<ol>
  <li>Open repository on GitHub</li>
  <li>Click <b>Compare & Pull Request</b></li>
  <li>Base branch → <b>main</b></li>
  <li>Compare branch → <b>sumanth-feature</b></li>
  <li>Add description</li>
  <li>Click <b>Create Pull Request</b></li>
</ol>

<hr/>

<h2>👀 Step 9: Code Review</h2>

<ul>
  <li>Team members review code</li>
  <li>Add comments or request changes</li>
  <li>Approve and merge PR</li>
</ul>

<hr/>

<h2>🔄 Step 10: Pull Latest Changes (Daily Rule)</h2>

<pre>
git checkout main
git pull origin main
</pre>

<p>Update your branch:</p>

<pre>
git checkout sumanth-feature
git merge main
</pre>

<hr/>

<h2>⚔️ Step 11: Handling Merge Conflicts</h2>

<p>
Conflicts occur when two people edit the same lines.
</p>

<pre>
<<<<<<< HEAD
your code
=======
team member code
>>>>>>> main
</pre>

<p>
Resolve manually, then:
</p>

<pre>
git add .
git commit -m "Resolved merge conflict"
</pre>

<p>
VS Code provides a visual conflict resolver.
</p>

<hr/>

<h2>🧹 Step 12: Delete Branch After Merge</h2>

<pre>
git branch -d sumanth-feature
</pre>

<p>Delete remote branch:</p>

<pre>
git push origin --delete sumanth-feature
</pre>

<hr/>

<h2>📌 Most Used Git Commands</h2>

<pre>
git status
git branch
git checkout -b
git add .
git commit -m
git pull
git push
</pre>

<hr/>

<h2>🧠 Teamwork Rules</h2>

<ul>
  <li>✅ One feature = one branch</li>
  <li>✅ Pull before coding</li>
  <li>✅ Small, frequent commits</li>
  <li>❌ Never work directly on main</li>
  <li>❌ Never force-push on main</li>
</ul>

<hr/>

<h2>🧑‍🤝‍🧑 Recommended Team Workflow</h2>

<pre>
git pull origin main
git checkout -b your-branch
code
git add .
git commit -m "feature implemented"
git push
create pull request
</pre>

<hr/>

<h2>🧩 GitHub + VS Code Tips</h2>

<ul>
  <li>Use Source Control panel in VS Code</li>
  <li>Stage and commit visually</li>
  <li>Use Sync button (pull + push)</li>
  <li>Resolve conflicts directly in editor</li>
</ul>

<hr/>

<p align="center">
  👨‍💻 <b>Prepared by Sumanth</b><br/>
  ⭐ This guide is ideal for college group projects & real-world teamwork
</p>

