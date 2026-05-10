<script setup lang="ts">
import { TBottomNav } from '@vitaliysimkin/t-components'

const menuItems = [
  { route: '/demo/home', title: 'Home', icon: 'material-symbols-light:home-outline' },
  { route: '/demo/inbox', title: 'Inbox', icon: 'material-symbols-light:inbox-outline' },
  { route: '/demo/calendar', title: 'Calendar', icon: 'material-symbols-light:calendar-month-outline' },
  { route: '/demo/files', title: 'Files', icon: 'material-symbols-light:folder-outline' },
  { route: '/demo/dashboard', title: 'Dashboard', icon: 'material-symbols-light:space-dashboard-outline' },
  { route: '/demo/projects', title: 'Projects', icon: 'material-symbols-light:rocket-launch-outline' },
  { route: '/demo/teams', title: 'Teams', icon: 'material-symbols-light:groups-outline' },
  { route: '/demo/billing', title: 'Billing', icon: 'material-symbols-light:credit-card-outline' },
  { route: '/demo/settings', title: 'Settings', icon: 'material-symbols-light:settings-outline' },
  { route: '/demo/help', title: 'Help', icon: 'material-symbols-light:help-outline' },
]
</script>

<template>
  <!-- swallow demo nav -->
  <div
    class="frame"
    @click.capture.prevent
  >
    <div class="frame__phone">
      <div class="frame__content">
        <div class="frame__title">
          Mobile preview
        </div>
        <p class="frame__hint">
          Tap the center logo to open the bottom-sheet menu.
        </p>
      </div>

      <TBottomNav
        :menu-items="menuItems"
        header-icon="system-uicons:document-stack"
        header-label="Open menu"
        menu-label="Menu"
      >
        <template #profile>
          <div class="profile">
            <div class="profile__avatar">
              D
            </div>
            <div class="profile__info">
              <span class="profile__name">Demo User</span>
              <span class="profile__email">demo@example.com</span>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="footer">
            v0.8.5
          </div>
        </template>
      </TBottomNav>
    </div>
  </div>
</template>

<style scoped>
.frame {
  display: flex;
  justify-content: center;
  width: 100%;
}

.frame__phone {
  position: relative;
  width: 360px;
  height: 640px;
  background: var(--t-color-bg);
  border: 1px solid var(--t-color-border);
  border-radius: var(--t-radius-large);
  overflow: hidden;
}

/* Override the fixed positioning so the bar is contained inside the phone frame for the demo. */
.frame__phone :deep(.t-bottom-nav__bar) {
  position: absolute;
}

.frame__phone :deep(.t-bottom-nav__sheet-root) {
  position: absolute;
}

.frame__content {
  padding: var(--t-space-4);
  color: var(--t-color-text);
}

.frame__title {
  font-size: var(--t-font-size-large);
  font-weight: 600;
  margin-bottom: var(--t-space-2);
}

.frame__hint {
  color: var(--t-color-text-muted);
  font-size: var(--t-font-size-default);
}

.profile {
  display: flex;
  align-items: center;
  gap: var(--t-space-3);
}

.profile__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--t-color-accent);
  color: var(--t-color-accent-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--t-font-size-medium);
  flex-shrink: 0;
}

.profile__info {
  display: flex;
  flex-direction: column;
}

.profile__name {
  font-size: var(--t-font-size-default);
  font-weight: 600;
  color: var(--t-color-text);
}

.profile__email {
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}

.footer {
  text-align: center;
  font-size: var(--t-font-size-mini);
  color: var(--t-color-text-muted);
}
</style>
