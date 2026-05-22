# 08 - Modelo de datos y API

## Convenciones

- Usar snake_case en base de datos.
- IDs enteros autoincrementales para SQLite.
- Fechas en UTC.
- Campos de auditoría básicos.
- Booleanos `is_visible`, `is_enabled`, `is_featured`.

## Tablas sugeridas

```txt
users
site_settings
sections
band_members
band_bios
quick_facts
social_links
music_releases
media_types
media_categories
media_items
events
press_quotes
rider_profiles
rider_members
rider_input_list
rider_backline
rider_monitoring
rider_electrical
rider_show_lengths
rider_contacts
rider_hospitality
download_assets
download_requests
contact_messages
analytics_events_optional
```

## users

```txt
id
email
password_hash
name
role
is_active
created_at
updated_at
```

## site_settings

```txt
id
band_name
tagline
subgenre
country
city
language_default
hero_image_id
cover_image_id
spotify_url
youtube_url
instagram_url
tiktok_url
facebook_url
contact_email
booking_email
press_email
created_at
updated_at
```

## sections

```txt
id
slug
title
description
is_enabled
show_in_home
show_empty_state
empty_state_message
sort_order
created_at
updated_at
```

## media_types

```txt
id
name
slug
created_at
updated_at
```

Valores iniciales (fijos):

```txt
image
video
reel
```

> **Nota:** Flyer y Portada/Artwork son **categorías** dentro de `image`, no tipos.
> Los descargables se gestionan en la tabla separada `download_assets`.

## media_categories

```txt
id
media_type_id
name
slug
parent_id
is_active
sort_order
created_at
updated_at
```

## media_items

```txt
id
media_type_id
category_id
title
description
file_url
thumbnail_url
source_url
source_type
mime_type
size_bytes
width
height
duration_seconds
credit_author
tags_json
is_featured
is_visible
sort_order
created_at
updated_at
```

## music_releases

```txt
id
title
description
release_date
spotify_url
youtube_url
cover_media_id
is_featured
is_visible
created_at
updated_at
```

## events

```txt
id
title
description
event_date
venue
city
country
ticket_url
poster_media_id
is_visible
created_at
updated_at
```

## press_quotes

```txt
id
quote
author
media_name
url
quote_date
is_visible
created_at
updated_at
```

## download_assets

```txt
id
title
description
file_url
thumbnail_url
access_type
is_visible
send_via_email
expires_in_days
created_at
updated_at
```

access_type:

```txt
public
request_required
private
```

## download_requests

```txt
id
download_asset_id
name
email
organization
reason
message
status
approval_token
token_expires_at
approved_at
rejected_at
created_at
updated_at
```

status:

```txt
pending
approved
rejected
expired
```

## contact_messages

```txt
id
name
email
contact_type
message
status
created_at
updated_at
```

contact_type:

```txt
booking
press
collaboration
fan
other
```

## Endpoints públicos

```txt
GET /api/public/site-settings
GET /api/public/sections
GET /api/public/home
GET /api/public/band
GET /api/public/music
GET /api/public/media?type=&category=
GET /api/public/events
GET /api/public/press-epk
POST /api/public/contact
POST /api/public/download-requests
GET /api/public/downloads/{token}
```

## Endpoints privados CMS

```txt
POST /api/auth/login
POST /api/auth/logout
GET /api/admin/me

GET/PUT /api/admin/site-settings
GET/PUT /api/admin/sections
GET/POST/PUT/DELETE /api/admin/band
GET/POST/PUT/DELETE /api/admin/music
GET/POST/PUT/DELETE /api/admin/media
POST /api/admin/media/upload
POST /api/admin/media/import/google-photos
POST /api/admin/media/import/zip
GET/POST/PUT/DELETE /api/admin/events
GET/POST/PUT/DELETE /api/admin/press-quotes
GET/POST/PUT/DELETE /api/admin/rider
GET/POST/PUT/DELETE /api/admin/download-assets
GET/PUT /api/admin/download-requests/{id}
GET /api/admin/contact-messages
```

## Respuestas API

Formato estándar:

```json
{
  "success": true,
  "data": {},
  "message": null,
  "errors": []
}
```

## Paginación

Para multimedia y mensajes:

```txt
page
page_size
total
items
```

