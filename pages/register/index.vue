<template>
  <div class="md-layout md-alignment-center-center" style="height: 100vh;">
    <md-card class="md-layout-item md-size-50">
      <md-card-header>
        <div class="md-title">Register</div>
      </md-card-header>

      <!-- Register Form -->
      <form @submit.prevent="validateForm">
        <md-card-content>
          <md-field md-clearable :class="getValidationClass('email')">
            <label for="email">Email</label>
            <md-input
              :disabled="loading"
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              v-model="form.email"
            />
            <span class="md-error" v-if="!$v.form.email.required"
              >The email is required</span
            >
            <span class="md-error" v-else-if="!$v.form.email.email"
              >Invalid email</span
            >
          </md-field>

          <md-field :class="getValidationClass('password')">
            <label for="password">Password</label>
            <md-input
              :disabled="loading"
              type="password"
              name="password"
              id="password"
              autocomplete="password"
              v-model="form.password"
            />
            <span class="md-error" v-if="!$v.form.password.required"
              >The password is required</span
            >
            <span class="md-error" v-else-if="!$v.form.password.minLength"
              >Password too short</span
            >
            <span class="md-error" v-else-if="!$v.form.password.maxLength"
              >Password too long</span
            >
          </md-field>
        </md-card-content>

        <md-card-actions>
          <md-button to="/login">Go to Login</md-button>
          <md-button
            class="md-primary md-raised"
            type="submit"
            :disabled="loading"
            >Submit</md-button
          >
        </md-card-actions>
      </form>

      <md-snackbar :md-active.sync="isAuthenticated">
        {{ form.email }} was successfully registered!
      </md-snackbar>
    </md-card>
  </div>
</template>

<script>
import { validationMixin } from "vuelidate";
import {
  required,
  email,
  minLength,
  maxLength
} from "vuelidate/lib/validators";

export default {
  middleware: "auth",
  mixins: [validationMixin],
  data: () => ({
    form: {
      email: "",
      password: ""
    }
  }),
  validations: {
    form: {
      email: {
        required,
        email
      },
      password: {
        required,
        minLength: minLength(6),
        maxLength: maxLength(20)
      }
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    isAuthenticated() {
      return this.$store.getters.isAuthenticated;
    }
  },
  watch: {
    isAuthenticated(value) {
      if (value) {
        setTimeout(() => this.$router.push("/"), 2000);
      }
    }
  },
  methods: {
    validateForm() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.registerUser();
      }
    },
    async registerUser() {
      await this.$store.dispatch("authenticateUser", {
        email: this.form.email,
        password: this.form.password,
        returnSecureToken: true
      });
    },
    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];
      if (field) {
        return {
          "md-invalid": field.$invalid && field.$dirty
        };
      }
    }
  }
};
</script>
