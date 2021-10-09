# Blind card

[![hacs_badge](https://img.shields.io/badge/HACS-Default-orange.svg?style=for-the-badge)](https://github.com/custom-components/hacs)

This card allows to open, close or set a blind to the position you want. The Color of the blind can also be defined. This is a fork of the Shutter Card by Deejayfool

![blind card](https://raw.githubusercontent.com/tungmeister/hass-blind-card/master/images/blind-anim.gif)

## Configuration

### General

| Name | Type | Required | Default | Description
| ---- | ---- | -------- | ------- | -----------
| type | string | True | - | Must be "custom:blind-card"
| title | string | False | - | Title of the card

### Entities

| Name | Type | Required | Default | Description
| ---- | ---- | -------- | ------- | -----------
| entity | string | True | - | The blind entity ID
| name | string | False | _Friendly name of the entity_ | Name to display for the blind
| buttons_position | string | False | `left` | Set buttons on `left` or on `right` of the blind
| title_position | string | False | `top` | Set title on `top` or on `bottom` of the blind
| invert_percentage | boolean | False | `false` | Set it to `true` if your blind is 100% when it is closed, and 0% when it is opened
| blind_color | string | False | 'white' | Set blind Color e.g. `green` or hex `#00FF00`

_Remark : you can also just give the entity ID (without to specify `entity:`) if you don't need to specify the other configurations._

### Sample

```yaml
type: 'custom:blind-card'
title: My blinds
entities:
  - entity: cover.left_living_blind
    name: Left blind
    buttons_position: left
    title_position: bottom
    blind_color: '#FFD580'
  - cover.bedroom_blind
```
![Colored Blind](https://raw.githubusercontent.com/tungmeister/hass-blind-card/master/images/colored.png)

## Install

If you use HACS, the resources will automatically be configured with the needed file.

If you don't use HACS, you can download js file from [latest releases](https://github.com/tungmeister/hass-blind-card/releases/). Drop it then in `www` folder in your `config` directory. Next add the following entry in lovelace configuration:

```yaml
resources:
  - url: /local/hass-blind-card.js
    type: module
```
