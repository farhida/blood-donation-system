from django.db import connection, IntegrityError, transaction
from core.models import UserProfile


def get_or_create_profile(user):
    """Return (profile, created).

    This helper tries the ORM create first. If the DB schema still contains
    legacy NOT NULL columns (e.g. donated_recently/not_ready) the ORM insert
    may fail. In that case we perform a raw INSERT supplying sensible defaults
    for the legacy columns and re-fetch the row.
    """
    prof = UserProfile.objects.filter(user=user).first()
    if prof:
        return prof, False

    try:
        prof = UserProfile.objects.create(user=user)
        return prof, True
    except IntegrityError:
        # Fallback: try raw SQL insert including legacy columns (safe defaults)
        table = UserProfile._meta.db_table
        cols = ['user_id', 'phone', 'blood_group', 'last_donation', 'district', 'share_phone', 'donated_recently', 'not_ready']
        placeholders = ','.join(['%s'] * len(cols))
        sql = f"INSERT INTO {table} ({', '.join(cols)}) VALUES ({placeholders})"
        params = [user.id, None, None, None, None, False, False, False]
        with transaction.atomic():
            with connection.cursor() as cur:
                cur.execute(sql, params)
        prof = UserProfile.objects.get(user=user)
        return prof, True
