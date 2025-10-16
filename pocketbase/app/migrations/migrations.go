package migrations

import (
	"fmt"
	"math/rand"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

const (
	minValue     = 1.0
	maxValue     = 500_000_000_000.0
	startYear    = 1999
	startQuarter = 1
	endYear      = 2025
	endQuarter   = 4
)

func init() {
	m.Register(func(app core.App) error {
		if err := recreateValueQuartersCollection(app); err != nil {
			return err
		}

		if err := recreateCountersCollection(app); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		if coll, err := app.FindCollectionByNameOrId("value_quarters"); err == nil {
			if err := app.Delete(coll); err != nil {
				return err
			}
		}

		if coll, err := app.FindCollectionByNameOrId("counters"); err == nil {
			if err := app.Delete(coll); err != nil {
				return err
			}
		}

		return nil
	})
}

func recreateValueQuartersCollection(app core.App) error {
	if existing, err := app.FindCollectionByNameOrId("value_quarters"); err == nil {
		if err := app.Delete(existing); err != nil {
			return err
		}
	}

	collection := core.NewBaseCollection("value_quarters")
	collection.ListRule = types.Pointer("")   // Public read access
	collection.ViewRule = types.Pointer("")   // Public read access
	collection.CreateRule = nil               // No public creation
	collection.UpdateRule = nil               // No public updates
	collection.DeleteRule = nil               // No public deletion
	
	collection.Fields.Add(
		&core.TextField{
			Name:     "quarter",
			Required: true,
		},
	)
	
	collection.Fields.Add(
		&core.NumberField{
			Name:     "value",
			Required: true,
		},
	)
	
	collection.Indexes = types.JSONArray[string]{
		"CREATE UNIQUE INDEX idx_value_quarters_quarter ON value_quarters (quarter)",
	}

	if err := app.Save(collection); err != nil {
		return err
	}

	rng := rand.New(rand.NewSource(42))

	for year := startYear; year <= endYear; year++ {
		qStart := 1
		if year == startYear {
			qStart = startQuarter
		}

		qEnd := 4
		if year == endYear {
			qEnd = endQuarter
		}

		for quarter := qStart; quarter <= qEnd; quarter++ {
			record := core.NewRecord(collection)
			record.Set("quarter", fmt.Sprintf("%dQ%d", year, quarter))
			record.Set("value", rng.Float64()*(maxValue-minValue)+minValue)

			if err := app.Save(record); err != nil {
				return err
			}
		}
	}

	return nil
}

func recreateCountersCollection(app core.App) error {
	if existing, err := app.FindCollectionByNameOrId("counters"); err == nil {
		if err := app.Delete(existing); err != nil {
			return err
		}
	}

	collection := core.NewBaseCollection("counters")
	collection.ListRule = types.Pointer("")   // Public read access
	collection.ViewRule = types.Pointer("")   // Public read access
	collection.CreateRule = types.Pointer("") // Public creation allowed
	collection.UpdateRule = types.Pointer("") // Public update allowed
	collection.DeleteRule = nil               // No public deletion
	
	collection.Fields.Add(
		&core.NumberField{
			Name:     "value",
			Required: false,
		},
	)

	if err := app.Save(collection); err != nil {
		return err
	}

	record := core.NewRecord(collection)
	record.Set("id", "maincounterid00")
	record.Set("value", 0)

	if err := app.Save(record); err != nil {
		return err
	}

	return nil
}
