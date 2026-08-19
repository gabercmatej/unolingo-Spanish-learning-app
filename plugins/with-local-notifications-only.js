const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Strip the Push Notifications entitlement that expo-notifications adds.
 *
 * `expo-notifications` ships an `app.plugin.js`, and Expo applies the config
 * plugin of every *autolinked* package — so the plugin runs whether or not it
 * appears in app.json's `plugins`, and removing it from that list achieves
 * nothing. What it writes is `aps-environment`, the Push Notifications
 * capability, and a free Apple Personal Team cannot provision an app that asks
 * for it: "Personal development teams do not support the Push Notifications
 * capability." The device build fails at signing with no profile at all.
 *
 * Unolingo never sends a push. Every reminder is scheduled locally on the
 * device by `learning/reminders.ts`, which needs no server, no APNs token and
 * no entitlement — `aps-environment` governs remote delivery only, so removing
 * it costs the app nothing it uses.
 *
 * Registered last in app.json so its entitlements mod runs after the
 * autolinked one and the delete wins.
 */
module.exports = function withLocalNotificationsOnly(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
