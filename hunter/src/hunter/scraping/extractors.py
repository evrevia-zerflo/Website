# The cascade is currently embedded in generic.py for simplicity.
# This file serves as an extension point for more complex extraction logic later.
# For now, it just imports the generic adapter which houses the basic cascade.

from hunter.scraping.adapters.generic import GenericAdapter
from hunter.scraping.adapters.onlinekurtis import OnlineKurtisAdapter
from hunter.scraping.adapters.meesho import MeeshoAdapter

def get_adapter(supplier_config):
    if supplier_config.adapter == "onlinekurtis":
        return OnlineKurtisAdapter(supplier_config)
    if supplier_config.adapter == "meesho":
        return MeeshoAdapter(supplier_config)
    if supplier_config.adapter == "generic":
        return GenericAdapter(supplier_config)
    # Add supplier specific adapters here later
    return GenericAdapter(supplier_config)
