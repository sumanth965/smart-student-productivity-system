<h1 align="center">🤝 GitHub Teamwork & Branching Guide</h1>

<hr/>

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
  <li>Paste the repository URL</li>
  <li>Select a local folder</li>
  <li>Click <b>Open</b></li>
</ol>

<h3>Option B: Clone using Terminal</h3>

<pre>
git clone https://github.com/sumanth965/smart-student-productivity-system.git
cd smart-student-productivity-system
code .
</pre>

<hr/>

<h2>🔍 Step 2: Check Repository Status</h2>

<pre>
git status
</pre>

<p>This command shows:</p>
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
├── sumana
├── sumanth
├── sweedal
├── tanvi
└── tarun
</pre>

<p>
Each team member works on their own branch.
</p>

<hr/>

<h2>🌱 Step 4: Create and Switch to a Branch</h2>

<p>Check existing branches:</p>
<pre>
git branch
</pre>

<p>Create and switch to a new branch:</p>
<pre>
git checkout -b sumanth
</pre>

<p>OR</p>

<pre>
git switch -c sumanth
</pre>

<hr/>

<h2>✍️ Step 5: Work on Your Branch</h2>

<ul>
  <li>Write or modify code</li>
  <li>Add new files if required</li>
  <li>Check changes frequently</li>
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

<h3>Commit changes</h3>
<pre>
git commit -m "Added login page UI"
</pre>

<p>
✔ Always write clear and meaningful commit messages.
</p>

<hr/>

<h2>⬆️ Step 7: Push Branch to GitHub</h2>

<p>First-time push:</p>
<pre>
git push -u origin sumanth
</pre>

<p>Subsequent pushes:</p>
<pre>
git push
</pre>

<hr/>

<h2>🔀 Step 8: Create a Pull Request (PR)</h2>

<ol>
  <li>Open the repository on GitHub</li>
  <li>Click <b>Compare & Pull Request</b></li>
  <li>Base branch → <b>main</b></li>
  <li>Compare branch → <b>sumanth</b></li>
  <li>Add a short description</li>
  <li>Click <b>Create Pull Request</b></li>
</ol>

<hr/>

<h2>👀 Step 9: Code Review</h2>

<ul>
  <li>Team members review the code</li>
  <li>Suggestions or changes may be requested</li>
  <li>After approval, the PR is merged</li>
</ul>

<hr/>

<h2>🔄 Step 10: Pull Latest Changes (Daily Rule)</h2>

<p>Update local main branch:</p>
<pre>
git checkout main
git pull origin main
</pre>

<p>Update your branch with main:</p>
<pre>
git checkout sumanth
git merge main
</pre>

<hr/>

<h2>⚔️ Step 11: Handling Merge Conflicts</h2>

<p>
Merge conflicts occur when two people edit the same lines of code.
</p>

<pre>
<<<<<<< HEAD
your code
=======
team member code
>>>>>>> main
</pre>

<p>Resolve the conflict manually, then:</p>

<pre>
git add .
git commit -m "Resolved merge conflict"
</pre>

<p>
VS Code provides a visual interface to resolve conflicts easily.
</p>

<hr/>

<h2>🧹 Step 12: Delete Branch After Merge</h2>

<p>Delete local branch:</p>
<pre>
git branch -d sumanth
</pre>

<p>Delete remote branch:</p>
<pre>
git push origin --delete sumanth
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
  <li>✅ Pull before starting work</li>
  <li>✅ Commit frequently with clear messages</li>
  <li>❌ Never work directly on main</li>
  <li>❌ Never force-push to main</li>
</ul>

<hr/>

<h2>🧑‍🤝‍🧑 Recommended Team Workflow</h2>

<pre>
git pull origin main
git checkout -b your-branch-name
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
  <li>Stage and commit changes visually</li>
  <li>Sync regularly (pull + push)</li>
  <li>Resolve merge conflicts inside VS Code</li>
</ul>
