<div class="vstack gap-2 ff-terminal">
    <div class="hstack gap-2 text-light">
        <div class="badge bg-success text-light">Success</div>
        <div class="prompt">......</div>
        <div class="prompt">Clearing all tables in database</div>
    </div>
    <div class="hstack gap-2 text-light">
        <div class="badge bg-success text-light">Success</div>
        <div class="prompt">......</div>
        <div class="prompt">Migrating data to database</div>
    </div>
    <div class="hstack gap-2 text-light">
        <div class="badge bg-success text-light">Success</div>
        <div class="prompt">......</div>
        <div class="prompt">Filling the database with dummy data</div>
    </div>
    <div class="hstack gap-2 position-relative">
        <div class="cursor-blink prompt pe-3">
            <span class="pe-1">$></span>
            @if($activity == 'wipe') 
            <span>Database wiped</span>
            @elseif($activity == 'seed')
            <span>Database seeded</span>
            @endif
        </div>
    </div>
</div>