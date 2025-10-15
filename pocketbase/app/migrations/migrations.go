package migrations

import (
	"fmt"
	"math/rand"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/models/schema"
)

const (
	minValue     = 1.0
	maxValue     = 500_000_000_000.0
	startYear    = 1999
	startQuarter = 1
	endYear      = 2025
	endQuarter   = 4
)

func strPtr(v string) *string {
	return &v
}

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db)

		if err := recreateValueQuartersCollection(dao); err != nil {
			return err
		}

		if err := recreateCountersCollection(dao); err != nil {
			return err
		}

		return nil
	}, func(db dbx.Builder) error {
		dao := daos.New(db)

		if coll, err := dao.FindCollectionByNameOrId("value_quarters"); err == nil {
			if err := dao.DeleteCollection(coll); err != nil {
				return err
			}
		}

		if coll, err := dao.FindCollectionByNameOrId("counters"); err == nil {
			if err := dao.DeleteCollection(coll); err != nil {
				return err
			}
		}

		return nil
	})
}

func recreateValueQuartersCollection(dao *daos.Dao) error {
	if existing, err := dao.FindCollectionByNameOrId("value_quarters"); err == nil {
		if err := dao.DeleteCollection(existing); err != nil {
			return err
		}
	}

	collection := &models.Collection{
		Name:       "value_quarters",
		Type:       models.CollectionTypeBase,
		ListRule:   strPtr(""),
		ViewRule:   strPtr(""),
		CreateRule: nil,
		UpdateRule: nil,
		DeleteRule: nil,
		Schema: schema.NewSchema(
			&schema.SchemaField{
				Name:     "quarter",
				Type:     schema.FieldTypeText,
				Required: true,
				Options:  &schema.TextOptions{},
			},
			&schema.SchemaField{
				Name:     "value",
				Type:     schema.FieldTypeNumber,
				Required: true,
				Options:  &schema.NumberOptions{},
			},
		),
		Indexes: []string{
			"CREATE UNIQUE INDEX idx_value_quarters_quarter ON value_quarters (quarter)",
		},
	}

	if err := dao.SaveCollection(collection); err != nil {
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
			record := models.NewRecord(collection)
			record.Set("quarter", fmt.Sprintf("%dQ%d", year, quarter))
			record.Set("value", rng.Float64()*(maxValue-minValue)+minValue)

			if err := dao.SaveRecord(record); err != nil {
				return err
			}
		}
	}

	return nil
}

func recreateCountersCollection(dao *daos.Dao) error {
	if existing, err := dao.FindCollectionByNameOrId("counters"); err == nil {
		if err := dao.DeleteCollection(existing); err != nil {
			return err
		}
	}

	collection := &models.Collection{
		Name:       "counters",
		Type:       models.CollectionTypeBase,
		ListRule:   strPtr(""),
		ViewRule:   strPtr(""),
		CreateRule: nil,
		UpdateRule: strPtr(""),
		DeleteRule: nil,
		Schema: schema.NewSchema(
			&schema.SchemaField{
				Name:     "value",
				Type:     schema.FieldTypeNumber,
				Required: false,
				Options:  &schema.NumberOptions{},
			},
		),
	}

	if err := dao.SaveCollection(collection); err != nil {
		return err
	}

	record := models.NewRecord(collection)
	record.SetId("main")
	record.Set("value", 0)

	if err := dao.SaveRecord(record); err != nil {
		return err
	}

	return nil
}
