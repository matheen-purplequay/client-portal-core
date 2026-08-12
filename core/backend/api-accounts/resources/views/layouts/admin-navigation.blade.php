<nav class="navbar navbar-expand-lg bg-white shadow-sm py-0 sticky-top">
    <div class="container">
        <a class="navbar-brand" href="#">
            Carisma Solutions
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link {{ (request()->getRequestUri() == '/admin/dashboard')? 'active' : '' }}" href="/admin/dashboard">
                        Dashboard
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ (request()->getRequestUri() == '/admin/users')? 'active' : '' }}" href="/admin/users">Users</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ (request()->getRequestUri() == '/admin/services')? 'active' : '' }}" href="/admin/services">Services</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ (request()->getRequestUri() == '/admin/projects')? 'active' : '' }}" href="/admin/projects">Projects</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ (request()->getRequestUri() == '/admin/apps')? 'active' : '' }}" href="/admin/apps">Apps</a>
                </li>
            </ul>
            <div class="hstack gap-2">
                <div>
                    <div class="small">
                        <a href="/admin/client-chooser">
                            {{ Session::get('selected_client')->name ?? 'Choose a client'}}
                        </a>
                    </div>
                </div>
                <div class="dropdown">
                    <button class="btn btn-light dropdown-toggle rounded-pill" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa-solid fa-circle-user"></i>
                    </button>
                    <ul class="dropdown-menu shadow border-0">
                        <li><a class="dropdown-item" href="#">Profile</a></li>
                        <li><a class="dropdown-item" href="#">Settings</a></li>
                        <li>
                            <form action="/logout" method="post">
                                @csrf
                                <button class="dropdown-item" type="submit">Logout</button>
                            </form>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</nav>

<div class="bg-light border-bottom">
    <div class="container">
        <div class="small py-1 opacity-50">
            <i class="fa-solid fa-circle-user"></i>
            Logged in as Carisma Admin
        </div>
    </div>
</div>