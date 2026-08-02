# Second Thought Mini CMS on Cloudflare

This mini CMS lets a non-coder edit website text from `/admin` using simple forms.

## Cloudflare setup

### 1. Create a KV namespace

In Cloudflare, create a KV namespace, for example:

```text
SECOND_THOUGHT_CMS
```

### 2. Bind the KV namespace to Pages Functions

In your Cloudflare Pages project settings, add a KV binding:

```text
Variable name: CMS_CONTENT
KV namespace: SECOND_THOUGHT_CMS
```

### 3. Protect the admin area

Use Cloudflare Access / Zero Trust to protect:

```text
/admin*
/api/cms/save
```

Allow only your email address or trusted editors.

## Editing content

Open:

```text
/admin
```

Edit fields and select **Save changes**.

The public website reads saved text from:

```text
/api/cms/content
```

If KV is empty or unavailable, the site falls back to the default text built into the app.

## What Phase 1 covers

- Arrival screen
- Choice screen
- I’m ready landing
- Explore home / intro copy
- Ecosystem map labels
- Footer text
- Main website menu/page content and expandable sections

Later phases can make Practice Engine labels, accessibility panel labels, and Pause & Breathe exercise text editable if required.
