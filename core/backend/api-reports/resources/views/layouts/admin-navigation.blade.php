<nav class="navbar navbar-expand-lg bg-body-tertiary sticky-top">
	<div class="container">
		<a class="navbar-brand" href="/">
			<img style="height: 32px; width: auto;" src="https://www.carisma-solutions.com.au/assets/img/icons/CS%20logo.png" alt="">
		</a>
		<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
						Uploads
					</a>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="/reports">Add Reports</a></li>
						<li><a class="dropdown-item" href="/agreed">Add Agreed Data</a></li>
						<li><a class="dropdown-item" href="#">Add Invoices</a></li>
					</ul>
				</li>
				<li class="nav-item">
					<a class="nav-link active" href="#">Newsletters</a>
				</li>
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
						Knowledge Center
					</a>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="#">Useful Tools</a></li>
						<li><a class="dropdown-item" href="#">Articles</a></li>
					</ul>
				</li>
				<li class="nav-item">
					<a class="nav-link active" href="#">Team</a>
				</li>
				<li class="nav-item">
					<a class="nav-link active" href="#">Calendar</a>
				</li>
				<li class="nav-item dropdown">
					<a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
						About
					</a>
					<ul class="dropdown-menu">
						<li><a class="dropdown-item" href="#">About - FAQ</a></li>
						<li><a class="dropdown-item" href="#">Information Center</a></li>
					</ul>
				</li>
			</ul>
			<form action="/logout" method="post">
				<button type="submit" class="nav-link rounded-3 bg-dark text-light px-2 py-1">Logout</button>
			</form>
		</div>
	</div>
</nav>