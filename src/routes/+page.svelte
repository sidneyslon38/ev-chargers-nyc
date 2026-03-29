<script>
  import ArticleHeader from '$lib/components/ArticleHeader.svelte';

  let { data } = $props();
  let selected = $state(null);


  let headline = 'NYC EV Fleet Chargers';
  let byline = 'NYCity News Service';
  let pubDate = '2026-03-16';

  let selectedBorough = $state('');
  let selectedChargerType = $state('');
  let selectedPublicCharger = $state('');
  let searchQuery = $state('');

  // added filter
  let filteredChargers = $derived(
    data.chargers.filter((charger) => {
      if (selectedBorough !== '' && charger.borough !== selectedBorough) return false;
      if (selectedChargerType !== '' && charger.type_of_charger !== selectedChargerType) return false;
      if (selectedPublicCharger !== '' && (charger.public_charger_ ?? '') !== selectedPublicCharger) return false;

      if (
        searchQuery !== '' &&
        !`${charger.station_name ?? ''} ${charger.street ?? ''} ${charger.city ?? ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    })
  );

  let displayed = $derived(filteredChargers.slice(0, 100));
  let boroughOptions = $derived([...new Set(data.chargers.map((c) => c.borough).filter(Boolean))].sort());
  let chargerTypeOptions = $derived([...new Set(data.chargers.map((c) => c.type_of_charger).filter(Boolean))].sort());
  let publicChargerOptions = $derived([...new Set(data.chargers.map((c) => c.public_charger_).filter(Boolean))].sort());
</script>

<svelte:head>
  <title>{headline} | NYCity News Service</title>
</svelte:head>

<div class="container">
  <ArticleHeader
    {headline}
    {byline}
    {pubDate}
  />
</div>

<div class="wide-container">
  <div class="filters">
    <label>
      Search
      <input
        type="search"
        placeholder="Station name or address"
        bind:value={searchQuery}
      />
    </label>

    <label>
      Borough
      <select bind:value={selectedBorough}>
        <option value="">All boroughs</option>
        {#each boroughOptions as borough}
          <option value={borough}>{borough}</option>
        {/each}
      </select>
    </label>

    <label>
      Charger type
      <select bind:value={selectedChargerType}>
        <option value="">All types</option>
        {#each chargerTypeOptions as chargerType}
          <option value={chargerType}>{chargerType}</option>
        {/each}
      </select>
    </label>

    <label>
      Public charger
      <select bind:value={selectedPublicCharger}>
        <option value="">All</option>
        {#each publicChargerOptions as publicValue}
          <option value={publicValue}>{publicValue}</option>
        {/each}
      </select>
    </label>

    <button
      type="button"
      onclick={() => {
        searchQuery = '';
        selectedBorough = '';
        selectedChargerType = '';
        selectedPublicCharger = '';
      }}
    >
      Reset
    </button>
  </div>

  <div class="chargers">
    {#each displayed as charger (charger.station_name)}
      <div class="card" onclick={() => selected = charger}>
        <h3>{charger.station_name?.length > 9 ? `${charger.station_name.slice(0, 9)}...` : charger.station_name}</h3>
        <p>{charger.borough}</p>
      </div>
    {/each}

    {#if displayed.length === 0}
      <p class="no-results">No chargers match your filters.</p>
    {/if}
  </div>
</div>

{#if selected}
  <div class="overlay" onclick={() => selected = null}>
    <div class="popup" onclick={(e) => e.stopPropagation()}>
      <button class="close-btn" onclick={() => selected = null}>&times;</button>
      <h2>{selected.station_name}</h2>
      <p><strong>Type of Charger:</strong> {selected.type_of_charger}</p>
      <p><strong>Location:</strong> {selected.street}</p>
      <p><strong>Borough:</strong> {selected.borough}</p>
      <p><strong>No. of Ports:</strong> {selected.no_of_ports}</p>
      <p><strong>Public Charger:</strong> {selected.public_charger_ && selected.public_charger_.trim() ? selected.public_charger_ : 'No – for NYC officials only'}</p>
    </div>
  </div>
{/if}

<style lang="scss">
  @use '$lib/styles' as *;

  .wide-container {
    max-width: 1300px;
    margin: var(--spacing-md) auto;
    padding: 0 var(--spacing-sm);
  }

  .chargers {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-sm);
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);

    label {
      display: grid;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
    }

    input,
    select,
    button {
      padding: var(--spacing-xs) var(--spacing-sm);
      border: var(--border-width-thin) solid var(--color-border);
      font: inherit;
      background: white;
    }

    button {
      cursor: pointer;
      align-self: end;
    }
  }

  .card {
    padding: var(--spacing-sm);
    border: var(--border-width-thin) solid var(--color-border);
    cursor: pointer;

    &:hover {
      background-color: var(--color-light-gray);
    }
  }

  .no-results {
    grid-column: 1 / -1;
    color: var(--color-medium-gray);
    margin: 0;
  }

    .overlay {
    position: fixed; // fixed means it doesnt move when you scroll
    top: 0;
    left: 0; // 0 top, 0 left means it starts at the very top-left corner of the screen
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex; 
    align-items: center; 
    justify-content: center; // align-items and justify-content center the popup in the middle of the screen
  }

  .popup {
    position: relative;
    background: white;
    padding: var(--spacing-lg);
    max-width: 500px;
    width: 90%;
  }

  .popup button {
    float: right;
    cursor: pointer;
  }

  .close-btn {
    position: absolute;
    top: var(--spacing-xs);
    right: var(--spacing-xs);
    background: none;
    border: none;
    font-size: var(--font-size-3xl);
    line-height: 1;
    color: var(--color-medium-gray);
    cursor: pointer;

    &:hover {
      color: var(--color-dark);
    }
  }
</style>