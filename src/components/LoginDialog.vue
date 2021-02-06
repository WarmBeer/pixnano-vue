<template>
  <v-row justify="center">
    <v-dialog
        v-model="dialog"
        persistent
        max-width="600px"
        style="z-index: 10"
    >
      <v-card>
        <v-toolbar
            flat
            dark
            color="primary"
        >
          <v-toolbar-title>Sign In</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn
              icon
              dark
              @click="dialog = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-card-text>
          <v-container>
            <v-row>
              <v-form
                  class="mt-4"
                  style="width: 100%"
                  ref="form"
                  v-model="valid"
              >
                <v-col cols="12">
                  <v-text-field
                      solo
                      flat
                      dense
                      background-color="light"
                      v-model="authentication.username"
                      label="Username*"
                      :counter="16"
                      :rules="[v => !!v || 'Username is required.', v => (v && v.length <= 16 && v.length >= 1) || 'Username can be min 1 and max 16 characters.', v => /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(v) || 'Illegal characters or wrong format.']"
                      required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                      solo
                      flat
                      dense
                      background-color="light"
                      v-model="authentication.password"
                      label="Password*"
                      type="password"
                      :counter="64"
                      :rules="[v => !!v || 'Password is required.', v => (v && v.length <= 64 && v.length >= 8) || 'Password can be min 8 and max 64 characters.']"
                      required
                  ></v-text-field>
                </v-col>
              </v-form>
            </v-row>
            <v-row class="mt-4">
              <small>*indicates required field</small>
            </v-row>
            <v-row>
              <v-btn
                  color="primary"
                  :disabled="!valid"
                  @click="loginAccount"
              >
                Sign In
              </v-btn>
              <v-btn
                  class="ml-4"
                  color="primary"
                  text
                  @click="dialog = false;showSignup()"
              >
                Create New Account
              </v-btn>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import md5 from "md5";

export default {
  name: "LoginDialog",
  props: ['showSignup'],
  data: () => ({
    SALT: 'Here comes the sun',
    dialog: false,
    valid: false,
    authentication: {
      username: '',
      password: '',
    },
  }),
  methods: {
    enable() {
      this.dialog = true;
    },
    disable() {
      this.dialog = false;
    },
    loginAccount() {
      const hashedPassword = md5(this.authentication.password + this.SALT);
      this.$socket.emit('authenticate', { username: this.authentication.username, password: hashedPassword });
    },
  },
}
</script>

<style scoped>

</style>
